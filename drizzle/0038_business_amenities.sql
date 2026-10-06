-- Bauplan Gastro (2026-10-06): belegte Google-Angaben (Reservierung, zum
-- Mitnehmen, Lieferung, vegetarisch, Frühstück, barrierefrei) je Betrieb.
ALTER TABLE `businesses`
  ADD COLUMN `amenities` json NULL AFTER `editorialSummary`;
