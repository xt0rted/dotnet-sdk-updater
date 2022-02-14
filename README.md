# dotnet-sdk-updater

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
`dry-run` | Same value as the dry-run input. | `false`
`updated` | If the file was updated with a new version. | `true`
`updated-version-from` | The starting version in the global.json. | `6.0.101`
`updated-version-to` | The new version in the global.json. | `6.0.102`
<!-- end outputs -->

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
