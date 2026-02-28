import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HH_API = "https://api.hh.ru";
const USER_AGENT = "ProStaff/1.0 (prostaff.icu)";

interface HHVacancy {
  id: string;
  name: string;
  employer?: { id: string; name: string; logo_urls?: { original?: string } };
  area?: { name: string };
  salary?: { from?: number; to?: number; currency?: string };
  schedule?: { id: string };
  experience?: { id: string };
  employment?: { id: string };
  snippet?: { requirement?: string; responsibility?: string };
  description?: string;
  alternate_url?: string;
  published_at?: string;
  archived?: boolean;
}

// Blacklist: titles containing these words are NEVER relevant (non-sport contexts)
const TITLE_BLACKLIST = [
  "пожарн", "огнетуш", "огнезащит",
  "охран труда", "промышленн безопасн",
  "педиатр", "стоматолог", "гинеколог", "офтальмолог", "дерматолог",
  "фармацевт", "провизор", "фельдшер",
  "бухгалтер", "кассир", "официант", "повар", "продавец",
  "менеджер по продаж", "торговый представитель",
  "парфюмер", "косметолог",
  "учитель", "воспитатель", "няня",
  "водитель", "курьер", "грузчик",
  "сварщик", "электрик", "слесарь", "монтажник",
  "оператор call", "оператор колл",
  "alice ai", "ai-тренер",
  "атомн", "аэс", "ядерн",
  "школ", "детский сад", "доу",
];

function isTitleRelevant(title: string, searchQuery: string): boolean {
  const lowerTitle = title.toLowerCase();

  // First: reject obviously irrelevant titles
  if (TITLE_BLACKLIST.some(word => lowerTitle.includes(word))) {
    return false;
  }

  const lowerQuery = searchQuery.toLowerCase();

  // Extract core words from query (e.g. "тренер по регби" → ["тренер", "регби"])
  // Filter out short prepositions and common connectors
  const stopWords = ["по", "для", "на", "из", "при", "или"];
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));

  if (queryWords.length === 0) return true;

  // Require ALL query words to be present in the title (strict match)
  // Use stem-like matching: check if the title contains the first 4+ chars of each word
  const allMatch = queryWords.every(word => {
    // For short words (3-4 chars), require exact substring match
    if (word.length <= 4) return lowerTitle.includes(word);
    // For longer words, match by stem (first 5 chars minimum) to handle Russian morphology
    const stem = word.slice(0, Math.min(word.length, 6));
    return lowerTitle.includes(stem);
  });

  return allMatch;
}

const experienceMap: Record<string, string> = {
  noExperience: "intern",
  between1And3: "junior",
  between3And6: "middle",
  moreThan6: "senior",
};

const employmentMap: Record<string, string> = {
  full: "full_time",
  part: "part_time",
  project: "contract",
  probation: "internship",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Optionally accept source_id to import specific source
    let sourceFilter: string | null = null;
    try {
      const body = await req.json();
      sourceFilter = body?.source_id || null;
    } catch {
      // no body = import all enabled sources
    }

    // Get enabled sources
    let sourcesQuery = supabase
      .from("hh_sources")
      .select("*")
      .eq("is_enabled", true);

    if (sourceFilter) {
      sourcesQuery = sourcesQuery.eq("id", sourceFilter);
    }

    const { data: sources, error: srcErr } = await sourcesQuery;
    if (srcErr) throw new Error(`Sources fetch error: ${srcErr.message}`);
    if (!sources || sources.length === 0) {
      return new Response(JSON.stringify({ message: "No enabled sources" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (const source of sources) {
      // Create import run
      const { data: run } = await supabase
        .from("import_runs")
        .insert({ source_id: source.id, status: "running" })
        .select("id")
        .single();

      const runId = run?.id;
      let itemsFound = 0, itemsCreated = 0, itemsUpdated = 0, itemsClosed = 0, itemsSkipped = 0;
      let runStatus = "success";
      let errorMsg: string | null = null;

      try {
        // Build HH API URL
        let searchUrl = `${HH_API}/vacancies?per_page=50`;

        // Parse filters first
        const filters = source.filters_json || {};

        if (source.type === "employer" && source.employer_id) {
          searchUrl += `&employer_id=${source.employer_id}`;
        } else if (source.type === "search" && source.search_query) {
          // Wrap multi-word queries in quotes for exact phrase matching
          // Prevents "тренер по регби" from matching "тренер" OR "регби" separately
          const rawQuery = source.search_query.trim();
          const hhQuery = rawQuery.includes(" ") && !rawQuery.startsWith('"')
            ? `"${rawQuery}"`
            : rawQuery;
          searchUrl += `&text=${encodeURIComponent(hhQuery)}`;
          // HH API uses "vacancy_search_fields" (not "search_field") to restrict search scope
          // Valid values: "name" (title only), "company_name", "description"
          const searchField = filters.search_field || "name";
          if (searchField !== "all") {
            searchUrl += `&vacancy_search_fields=${searchField}`;
          }
        }

        // Add other filters
        if (filters.area) searchUrl += `&area=${filters.area}`;
        if (filters.professional_role) searchUrl += `&professional_role=${filters.professional_role}`;
        if (filters.schedule) searchUrl += `&schedule=${filters.schedule}`;

        // Fetch vacancies from HH
        const hhResponse = await fetch(searchUrl, {
          headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        });

        if (!hhResponse.ok) {
          throw new Error(`HH API error: ${hhResponse.status} ${await hhResponse.text()}`);
        }

        const hhData = await hhResponse.json();
        const vacancies: HHVacancy[] = hhData.items || [];
        itemsFound = vacancies.length;

        // We need a company_id to link imported jobs. Use source.company_id or create a generic one
        let companyId = source.company_id;

        // If no company linked, we'll need to handle per-vacancy
        const externalIds = vacancies.map((v) => v.id);

        // Get existing jobs for this source (including rejected/closed — to skip them on re-import)
        const { data: existingJobs } = await supabase
          .from("jobs")
          .select("id, external_id, moderation_status, status")
          .eq("external_source", "hh")
          .eq("source_id", source.id);

        const existingMap = new Map(
          (existingJobs || []).map((j) => [j.external_id, { id: j.id, moderation_status: j.moderation_status, status: j.status }])
        );

        // Calculate cutoff date: 1 month ago
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);

        for (const vacancy of vacancies) {
          // Skip archived vacancies
          if (vacancy.archived) {
            console.log(`Skipping vacancy ${vacancy.id}: archived`);
            continue;
          }

          // Skip vacancies published more than 1 month ago
          if (vacancy.published_at) {
            const publishedAt = new Date(vacancy.published_at);
            if (publishedAt < cutoffDate) {
              console.log(`Skipping vacancy ${vacancy.id}: published too long ago (${vacancy.published_at})`);
              continue;
            }
          }

          // Relevance filter: skip vacancies whose title doesn't match sport-related keywords
          if (source.type === "search" && source.search_query) {
            if (!isTitleRelevant(vacancy.name, source.search_query)) {
              console.log(`Skipping vacancy ${vacancy.id}: title not relevant ("${vacancy.name}" vs query "${source.search_query}")`);
              itemsSkipped++;
              continue;
            }
          }

          // Fetch full details for richer data
          let description = vacancy.snippet?.requirement || "";
          let responsibilities = vacancy.snippet?.responsibility || "";
          
          try {
            const detailRes = await fetch(`${HH_API}/vacancies/${vacancy.id}`, {
              headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
            });
            if (detailRes.ok) {
              const detail = await detailRes.json();
              description = detail.description || description;
              responsibilities = detail.key_skills?.map((s: { name: string }) => s.name).join(", ") || responsibilities;
            } else {
              await detailRes.text(); // consume body
            }
          } catch {
            // use snippet data
          }

          // Determine company - use source's company or create/find by employer name
          let jobCompanyId = companyId;

          if (!jobCompanyId && vacancy.employer) {
            // Try find existing company by name
            const { data: existingCompany } = await supabase
              .from("companies")
              .select("id")
              .eq("name", vacancy.employer.name)
              .limit(1)
              .single();

            if (existingCompany) {
              jobCompanyId = existingCompany.id;
            } else {
              // Auto-create company from HH employer data
              const { data: newCompany, error: compErr } = await supabase
                .from("companies")
                .insert({
                  name: vacancy.employer.name,
                  logo_url: vacancy.employer.logo_urls?.original || null,
                  // user_id is nullable for auto-imported companies
                  country: "Россия",
                })
                .select("id")
                .single();

              if (compErr) {
                console.error(`Failed to create company "${vacancy.employer.name}":`, compErr);
                continue;
              }
              jobCompanyId = newCompany.id;
              console.log(`Auto-created company "${vacancy.employer.name}" with id ${newCompany.id}`);
            }
          }

          if (!jobCompanyId) continue;

          const isRemote = vacancy.schedule?.id === "remote";
          const level = vacancy.experience?.id
            ? experienceMap[vacancy.experience.id] || null
            : null;
          const contractType = vacancy.employment?.id
            ? employmentMap[vacancy.employment.id] || "full_time"
            : "full_time";

          const moderationStatus =
            source.moderation_mode === "auto_publish" ? "published" : "draft";
          const jobStatus =
            source.moderation_mode === "auto_publish" ? "active" : "draft";

          const jobData = {
            title: vacancy.name,
            description: description,
            responsibilities: responsibilities || null,
            company_id: jobCompanyId,
            city: vacancy.area?.name || null,
            country: "Россия",
            salary_min: vacancy.salary?.from || null,
            salary_max: vacancy.salary?.to || null,
            salary_currency: vacancy.salary?.currency || "RUR",
            is_remote: isRemote,
            level: level,
            contract_type: contractType,
            status: jobStatus,
            external_source: "hh",
            external_id: vacancy.id,
            external_url: vacancy.alternate_url || `https://hh.ru/vacancy/${vacancy.id}`,
            source_id: source.id,
            moderation_status: moderationStatus,
            role_id: source.role_id || null,
          };

          const existing = existingMap.get(vacancy.id);
          if (existing) {
            // Skip rejected or manually closed jobs — don't re-import them
            if (existing.moderation_status === "rejected" || existing.status === "closed") {
              console.log(`Skipping vacancy ${vacancy.id}: already ${existing.moderation_status}/${existing.status}`);
              continue;
            }
            // Update existing active/draft job
            const { error: upErr } = await supabase
              .from("jobs")
              .update({
                ...jobData,
                // Don't overwrite moderation_status/status for published jobs
                status: existing.moderation_status === "published" ? existing.status : jobData.status,
                moderation_status: existing.moderation_status === "published" ? "published" : jobData.moderation_status,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existing.id);

            if (upErr) console.error(`Update error for ${vacancy.id}:`, upErr);
            else itemsUpdated++;
          } else {
            // Insert
            const { error: insErr } = await supabase
              .from("jobs")
              .insert(jobData);

            if (insErr) console.error(`Insert error for ${vacancy.id}:`, insErr);
            else itemsCreated++;
          }
        }

        // Close vacancies that are no longer on HH (draft and published)
        // Don't touch rejected or manually closed jobs
        const currentExternalIds = new Set(externalIds);
        const toClose = (existingJobs || []).filter(
          (j) => j.external_id && !currentExternalIds.has(j.external_id)
            && j.moderation_status !== "rejected" && j.status !== "closed"
        );

        for (const job of toClose) {
          await supabase
            .from("jobs")
            .update({ status: "closed", updated_at: new Date().toISOString() })
            .eq("id", job.id);
          itemsClosed++;
        }

        // Delete closed jobs older than 60 days
        const deleteDate = new Date();
        deleteDate.setDate(deleteDate.getDate() - 60);
        const { error: delErr, count: deletedCount } = await supabase
          .from("jobs")
          .delete({ count: "exact" })
          .eq("external_source", "hh")
          .eq("source_id", source.id)
          .eq("status", "closed")
          .lt("updated_at", deleteDate.toISOString());

        if (delErr) console.error(`Delete old jobs error:`, delErr);
        else if (deletedCount && deletedCount > 0) {
          console.log(`Deleted ${deletedCount} closed jobs older than 60 days for source ${source.id}`);
        }
      } catch (err) {
        runStatus = "failed";
        errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`Import failed for source ${source.id}:`, errorMsg);
      }

      // Update import run
      if (runId) {
        await supabase
          .from("import_runs")
          .update({
            finished_at: new Date().toISOString(),
            status: runStatus,
            items_found: itemsFound,
            items_created: itemsCreated,
            items_updated: itemsUpdated,
            items_closed: itemsClosed,
            error_message: errorMsg,
          })
          .eq("id", runId);
      }

      results.push({
        source_id: source.id,
        source_name: source.name,
        status: runStatus,
        items_found: itemsFound,
        source_id: source.id,
        source_name: source.name,
        status: runStatus,
        items_found: itemsFound,
        items_created: itemsCreated,
        items_updated: itemsUpdated,
        items_closed: itemsClosed,
        items_skipped: itemsSkipped,
        error: errorMsg,
      });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("HH Import error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
