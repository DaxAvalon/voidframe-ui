// Country-name matching for maps keyed by free-text place names.
//
// `normalizeCountryName` folds case, diacritics and punctuation;
// `COUNTRY_ALIASES` maps common variants to one canonical English short
// name (the one world-atlas / Natural Earth `name` properties use);
// `matchCountryNames` re-keys a values map onto the feature names a map
// actually has and reports what it could not place.

export const COUNTRY_ALIASES: Record<string, string> = {
  "united states of america": "United States",
  usa: "United States",
  us: "United States",
  "u.s.": "United States",
  "u.s.a.": "United States",
  america: "United States",
  "united kingdom of great britain and northern ireland": "United Kingdom",
  uk: "United Kingdom",
  "u.k.": "United Kingdom",
  britain: "United Kingdom",
  "great britain": "United Kingdom",
  england: "United Kingdom",
  "russian federation": "Russia",
  "korea, republic of": "South Korea",
  "republic of korea": "South Korea",
  korea: "South Korea",
  "korea, democratic people's republic of": "North Korea",
  "democratic people's republic of korea": "North Korea",
  "czech republic": "Czechia",
  "ivory coast": "Côte d'Ivoire",
  "cote d'ivoire": "Côte d'Ivoire",
  burma: "Myanmar",
  "viet nam": "Vietnam",
  "iran, islamic republic of": "Iran",
  "islamic republic of iran": "Iran",
  turkiye: "Turkey",
  türkiye: "Turkey",
  holland: "Netherlands",
  "the netherlands": "Netherlands",
  uae: "United Arab Emirates",
  "u.a.e.": "United Arab Emirates",
  drc: "Dem. Rep. Congo",
  "democratic republic of the congo": "Dem. Rep. Congo",
  "congo, the democratic republic of the": "Dem. Rep. Congo",
  "congo-kinshasa": "Dem. Rep. Congo",
  "republic of the congo": "Congo",
  "congo-brazzaville": "Congo",
  "lao people's democratic republic": "Laos",
  "syrian arab republic": "Syria",
  "bolivia, plurinational state of": "Bolivia",
  "venezuela, bolivarian republic of": "Venezuela",
  "tanzania, united republic of": "Tanzania",
  "united republic of tanzania": "Tanzania",
  "moldova, republic of": "Moldova",
  "republic of moldova": "Moldova",
  "north macedonia": "Macedonia",
  "republic of north macedonia": "Macedonia",
  "macedonia, the former yugoslav republic of": "Macedonia",
  swaziland: "eSwatini",
  eswatini: "eSwatini",
  "cabo verde": "Cape Verde",
  "timor-leste": "Timor-Leste",
  "east timor": "Timor-Leste",
  "brunei darussalam": "Brunei",
  "central african republic": "Central African Rep.",
  "south sudan": "S. Sudan",
  "dominican republic": "Dominican Rep.",
  "bosnia and herzegovina": "Bosnia and Herz.",
  "equatorial guinea": "Eq. Guinea",
  "western sahara": "W. Sahara",
  "solomon islands": "Solomon Is.",
  "falkland islands": "Falkland Is.",
  "falkland islands (malvinas)": "Falkland Is.",
  "french southern territories": "Fr. S. Antarctic Lands",
  "hong kong": "Hong Kong",
  "taiwan, province of china": "Taiwan",
  "republic of china": "Taiwan",
  "people's republic of china": "China",
  prc: "China",
  "state of palestine": "Palestine",
  "palestinian territory": "Palestine",
  "vatican city": "Vatican",
  "holy see": "Vatican",
  "micronesia, federated states of": "Micronesia",
  "saint vincent and the grenadines": "St. Vin. and Gren.",
  "saint kitts and nevis": "St. Kitts and Nevis",
  "saint lucia": "Saint Lucia",
  "sao tome and principe": "São Tomé and Principe",
  "antigua and barbuda": "Antigua and Barb.",
  "united states virgin islands": "U.S. Virgin Is.",
  "british virgin islands": "British Virgin Is.",
  "cayman islands": "Cayman Is.",
  "faroe islands": "Faeroe Is.",
  "marshall islands": "Marshall Is.",
  "cook islands": "Cook Is.",
  "northern mariana islands": "N. Mariana Is.",
  "turks and caicos islands": "Turks and Caicos Is.",
  "trinidad and tobago": "Trinidad and Tobago",
  "south georgia and the south sandwich islands": "S. Geo. and the Is.",
  "heard island and mcdonald islands": "Heard I. and McDonald Is.",
};

/** Lower-case, strip diacritics and punctuation, collapse whitespace. */
export function normalizeCountryName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’'`´]/g, "'")
    .replace(/[^a-z0-9'&.,()\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface MatchCountryNamesOptions {
  /** Extra aliases (normalised or not) → canonical name, merged over `COUNTRY_ALIASES`. */
  aliases?: Record<string, string>;
}

export interface MatchCountryNamesResult {
  /** Values re-keyed by the matching feature name. */
  values: Record<string, number>;
  /** Input keys that matched no feature name (after aliases and normalisation). */
  unmatched: string[];
  /** Input key → feature name it was matched to. */
  mapping: Record<string, string>;
}

/**
 * Match free-text country keys onto the names a map's features carry.
 * Comparison is on normalised text; `COUNTRY_ALIASES` (and `options.aliases`)
 * resolve common variants first. Later duplicates overwrite earlier ones.
 *
 * ```ts
 * const names = topology.objects.countries.geometries.map((g) => g.properties.name);
 * const { values, unmatched } = matchCountryNames({ USA: 12, "Viet Nam": 3, Narnia: 1 }, names);
 * // values → { "United States": 12, Vietnam: 3 }; unmatched → ["Narnia"]
 * ```
 */
export function matchCountryNames(
  input: Record<string, number>,
  featureNames: readonly string[],
  options: MatchCountryNamesOptions = {}
): MatchCountryNamesResult {
  const byNormalized = new Map<string, string>();
  for (const name of featureNames) byNormalized.set(normalizeCountryName(name), name);
  const aliases = new Map<string, string>();
  for (const [k, v] of Object.entries(COUNTRY_ALIASES)) aliases.set(normalizeCountryName(k), v);
  for (const [k, v] of Object.entries(options.aliases ?? {})) aliases.set(normalizeCountryName(k), v);
  const values: Record<string, number> = {};
  const mapping: Record<string, string> = {};
  const unmatched: string[] = [];
  for (const [key, value] of Object.entries(input)) {
    const norm = normalizeCountryName(key);
    const canonical = aliases.get(norm);
    const target =
      byNormalized.get(norm) ??
      (canonical !== undefined ? byNormalized.get(normalizeCountryName(canonical)) : undefined);
    if (target === undefined) {
      unmatched.push(key);
      continue;
    }
    values[target] = value;
    mapping[key] = target;
  }
  return { values, unmatched, mapping };
}
