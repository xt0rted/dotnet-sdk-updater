# dotnet-sdk-updater

[![CI](https://github.com/xt0rted/dotnet-sdk-updater/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/xt0rted/dotnet-sdk-updater/actions/workflows/ci.yml)
[![CodeQL](https://github.com/xt0rted/dotnet-sdk-updater/actions/workflows/codeql-analysis.yml/badge.svg?branch=main)](https://github.com/xt0rted/dotnet-sdk-updater/actions/workflows/codeql-analysis.yml)

Update `global.json` files with the latest SDK version.

## Usage

<!-- start example -->
```yaml
- uses: xt0rted/dotnet-sdk-updater
```
<!-- end example -->

## Inputs

<!-- start inputs -->
Name | Description | Default
-- | -- | --
`dry-run` | Checks if an update is available but doesn't update the file. | `false`
`file-location` | The location of the global.json to check. | `./`
<!-- end inputs -->

## Outputs

<!-- start outputs -->
Name | Description | Example
-- | -- | --
`channel` | The major and minor version of the sdk. | `6.0`
`cve-list` | A json array of any CVEs included in the release. | `[{"id": "CVE-2022-21986", "url": "https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-21986"}]`
`dry-run` | Same value as the dry-run input. | `false`
`release-date` | The date of the release. | `2022-02-08`
`release-notes` | A URL to the release notes for the release. | `https://github.com/dotnet/core/blob/main/release-notes/6.0/6.0.2/6.0.2.md`
`release-version` | The version of the runtime for the release. | `6.0.2`
`security-release` | If this release contains security fixes. | `true`
`updated` | If the file was updated with a new version. | `true`
`updated-version-from` | The starting version in the global.json. | `6.0.101`
`updated-version-to` | The new version in the global.json. | `6.0.102`
`update-type` | The difference between the from and to version (major, premajor, minor, preminor, patch, prepatch, or prerelease). | `patch`
<!-- end outputs -->

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
