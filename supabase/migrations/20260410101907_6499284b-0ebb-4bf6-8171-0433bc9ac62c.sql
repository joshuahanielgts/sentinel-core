CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Allow the edge function (service role) to insert, no RLS needed for public contact form
-- Enable RLS but allow inserts from anon for the edge function
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- No public read access - only service role can read submissions
