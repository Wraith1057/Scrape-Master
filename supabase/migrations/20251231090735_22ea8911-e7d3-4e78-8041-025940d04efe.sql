-- Create scraping_history table (no auth dependency)
CREATE TABLE public.scraping_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  data_type TEXT NOT NULL,
  content_filters JSONB,
  pages_scraped INTEGER DEFAULT 0,
  items_found INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for automatic timestamp updates on scraping_history
CREATE TRIGGER update_scraping_history_updated_at
  BEFORE UPDATE ON public.scraping_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();