-- Migration to add subtype to policies table
ALTER TABLE public.policies ADD COLUMN subtype text;
