# Camellia entity data notes

The supplied source is `entities/<culture>/<type>.xlsx`: 50 workbooks covering Chinese, Indian, Japanese, Korean, Pakistani, Vietnamese, and Western entity lists. The originals remain untouched.

- Most Asian sheets expose native text in `Entity`, English in `Translation`, and (usually) a `Culture` label.
- Indian sheets use language columns `hi`, `ml`, `mr`, `gu`, with English in `en`. These four language views are one Indian culture pool rather than four independent pools.
- Western sheets use English in `en` and translations in language-named columns. Western cricket and football club sheets are merged as `sports`.
- `names-male.xlsx` and `names-female.xlsx` define name gender. Values marked `Both` may legitimately occur in both source sheets; the normalized types remain separate.
- File names define entity type. A row-level recognized `Culture` value takes precedence, which matters for a few Pakistani workbooks containing Western-labelled rows.
- Western follows the paper definition: North America plus Europe.

Cleaning follows `task.md`: whitespace is normalized; empty English values, non-Latin-script English values, strings over 32 characters, and values containing brackets are removed. Keys are lowercased, stripped of diacritics and non-alphanumerics. Duplicates within a pool/type keep the first spelling. A type/key found in multiple culture pools is removed everywhere. `data-src/blocklist.txt` is applied last.

The repository did not include Camellia's upstream root LICENSE alongside the supplied `entities` directory. A copy of the MIT license and attribution is stored in `THIRD_PARTY_LICENSES/CAMELLIA_LICENSE.txt` without modifying the protected source folder.
