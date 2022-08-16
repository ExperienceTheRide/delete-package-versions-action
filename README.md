# Delete Package Versions javascript action

This action deletes all package versions for the running repository whose name contains the given matchers.

## Inputs

## `matchers`

**Required** 

A "/" separated list of strings to match against package version names for deletion. Default `""`.

## `PACKAGE_TOKEN`

**Required** 

A GitHub Personal Access Token with the package delete scope. Default `""`.

## Example usage
```
uses: experiencetheride/delete-package-versions-action@v0.0.1
with:
  matchers: "alpha/beta"
  PACKAGE_TOKEN: ${{ secrets.DELETE_PACKAGE_PAT }}
```
