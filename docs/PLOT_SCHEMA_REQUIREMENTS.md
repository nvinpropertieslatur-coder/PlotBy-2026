# Plotby Plot Schema Requirements

Authoritative Phase 3.2 field specification restored from the planning requirements.

## Seven-step wizard

1. Dimensions & Pricing
2. Classification & Approvals
3. Facing & Road Access
4. Address & Geolocation
5. Plot Photos & Keywords
6. Contact & Ownership
7. Review & Publish

## Form fields

### 1. Dimensions & Pricing

`width_ft`, `length_ft`, `total_area_sqft`, `rate_per_sqft`, `base_amount`, `discount_type` (`none | percentage | flat`), `discount_value`, `discount_amount`, `final_amount`, and `is_negotiable`.

Area is width × length unless manually entered for irregular plots. Base amount is area × rate. Percentage and flat discounts are supported; amounts may not be negative and discounts may not exceed the base amount. Monetary values require decimal-safe calculations.

### 2. Classification & Approvals

`property_type`, `na_type`, and `layout_sanctioned`. NA options remain unresolved until confirmed. Plot numbers, survey numbers, sanction numbers, and sanctioning authorities are intentionally excluded.

### 3. Facing & Road Access

`primary_facing` plus one or more direction/width pairs. Road access is normalized in `plot_road_sides`, with one row per direction. Corner-plot flags are intentionally excluded.

### 4. Address & Geolocation

`full_address`, `locality`, `city_town`, `taluka`, `district`, `state`, `pincode`, `google_maps_url`, `latitude`, and `longitude`. State defaults to Maharashtra. Indian pincodes and coordinate ranges are validated.

### 5. Plot Photos & Keywords

`plot_images`, `cover_image`, `image_order`, and `search_keywords`. Images use local references and metadata in this phase; cloud uploads are deferred. Document functionality is intentionally excluded.

### 6. Contact & Ownership

`contact_name`, `contact_mobile`, and `ownership_type` (`owner | agent | developer`). Contact data is kept separate in the domain model for the future `plot_contacts` table.

### 7. Review & Publish

Read-only summary with edit actions. Complete validation is required for a publish-ready state, but publication is not implemented.

## Planned backend

Supabase PostgreSQL tables: `profiles`, `cities`, `plots`, `plot_road_sides`, `plot_images`, `favorites`, `plot_offers`, and `plot_inquiries`. Use UUID keys, foreign keys, indexes, NUMERIC money, timestamptz, RLS, server-side pricing validation, Storage policies, and versioned migrations.
