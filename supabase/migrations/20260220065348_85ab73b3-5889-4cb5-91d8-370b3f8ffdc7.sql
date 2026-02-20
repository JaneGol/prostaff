
-- Allow employers to view experiences of applicants
CREATE POLICY "Employers can view applicant experiences"
ON public.experiences
FOR SELECT
USING (is_applicant_to_my_jobs(profile_id));

-- Allow employers to view skills of applicants
CREATE POLICY "Employers can view applicant skills"
ON public.profile_skills
FOR SELECT
USING (is_applicant_to_my_jobs(profile_id));

-- Allow employers to view sports experience of applicants
CREATE POLICY "Employers can view applicant sports"
ON public.profile_sports_experience
FOR SELECT
USING (is_applicant_to_my_jobs(profile_id));

-- Allow employers to view education of applicants
CREATE POLICY "Employers can view applicant education"
ON public.candidate_education
FOR SELECT
USING (is_applicant_to_my_jobs(profile_id));

-- Allow employers to view certificates of applicants
CREATE POLICY "Employers can view applicant certificates"
ON public.candidate_certificates
FOR SELECT
USING (is_applicant_to_my_jobs(profile_id));

-- Allow employers to view portfolio of applicants
CREATE POLICY "Employers can view applicant portfolio"
ON public.candidate_portfolio
FOR SELECT
USING (is_applicant_to_my_jobs(profile_id));
