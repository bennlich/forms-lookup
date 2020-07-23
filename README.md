## How to update forms in the SRL Portal Drupal database

1) In the jcc-srl repo, update [`web/modules/custom/jcc_forms/jcc_forms.csv`](https://github.com/chapter-three/jcc-srl/blob/develop/web/modules/custom/jcc_forms/jcc_forms.csv). Commit your change, push, and deploy.

2) Log in with `terminus`:

```
terminus auth:login
```

3) Run the migration:

The `--execute-dependencies` option will also execute the `jcc_form_prefix` and `jcc_form_category` taxonomy term migrations.

Replace `<env>` with the name of the environment where you want to run the migration. E.g. `live` or `develop` or `pr-187`.

```
terminus drush jcc-srl.<env> migrate-import jcc_form_prefix --update
terminus drush jcc-srl.<env> migrate-import jcc_form_category --update
terminus drush jcc-srl.<env> migrate-import jcc_form --update
```

## courts.ca.gov forms lookup module

See [red-dot-integration/](red-dot-integration/).