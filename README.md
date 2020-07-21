# github-actions-trigger-extension
Adds an UI to trigger github actions from within github.

## Screenshots
<img src="https://raw.githubusercontent.com/mtricht/github-actions-trigger-extension/master/screenshots/trigger.png" />  
<img src="https://raw.githubusercontent.com/mtricht/github-actions-trigger-extension/master/screenshots/options.png" />

## Links
[Chrome Web Store](https://chrome.google.com/webstore/detail/github-actions-trigger/kmgblmkmjddfffkkgifhlbeeohmdakep)  
[Mozilla Addons](https://addons.mozilla.org/en-US/firefox/addon/github-actions-trigger/)  

## GAT JSON format
The GAT JSON is an array containing one or more objects as described below. Every object maps to a workflow that triggers on a `repository_dispatch` event.

**Required keys**
| Key | Description |
| --- | --- |
|`repository` | The repository that the trigger belongs to. |
|`name` | The `repository_dispatch` event name. |
|`parameters` | An array containing parameters, which will be mapped to the `github.event.client_payload` object in your workflow. |

**Parameter structure**
| Key | Description |
| --- | --- |
| `name` | The name of the parameters which will be available in your workflow as `github.event.client_payload.<name here>`. |
| `type` | The type of parameter. Currently supported are: `string`, `boolean` and `select` |
| `options` | An array containing a list of static options for a `select` parameter. |
| `optionsFrom` | A name of a repository where tags and/or branches are fetched from. |
`tags` | A boolean for whether to fetch tags from the `optionsFrom` repository. |
`branches` | A boolean for whether to fetch branches from the `optionsFrom` repository. |

Example GAT JSON:
```json
[
  {
    "repository": "mtricht/github-actions-trigger-extension",
    "name": "test",
    "parameters": [
      {
        "name": "param1",
        "type": "string"
      },
      {
        "name": "param2",
        "type": "boolean"
      },
      {
        "name": "param3",
        "type": "select",
        "options": [
          "prod",
          "acc"
        ]
      },
      {
        "name": "param4",
        "type": "select",
        "optionsFrom": "mtricht/github-actions-trigger-extension",
        "tags": true,
        "branches": true
      }
    ]
  }
]
```

Example workflow:

```yaml
name: Test

on:
  repository_dispatch:
    types: [test]

jobs:
  stage:
    name: Run tests
    runs-on: ubuntu-latest
    steps:
      - run: 'echo "field: ${{ github.event.client_payload.param1 }}"'
```
