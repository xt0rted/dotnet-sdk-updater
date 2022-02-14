import {
  readFile,
  writeFile,
} from "node:fs/promises";
import { load } from "js-yaml";

import packageJson from "../package.json";

const ACTION_YML = "action.yml";
const README_MD = "README.md";

interface ActionDefinition {
    name: string;
    description: string;
    author: string;
    branding: {
        icon: string;
        color: string;
    };
  inputs: Record<string, Input>;
  outputs: Record<string, Output>;
}

interface Input {
  description: string;
  required: boolean;
  default: string;
}

interface Output {
  description: string;
  example: string;
}

const name = actionName();

const fileContents = await readFile(ACTION_YML, { encoding: "utf8" });
const definition = load(fileContents) as ActionDefinition;

const example = [...buildUsageExample(name, definition)].join("\n");
const inputs = [...buildInputsTable(definition)].join("\n");
const outputs = [...buildOutputsTable(definition)].join("\n");

await updateReadme(example, inputs, outputs);

async function updateReadme(example: string, inputs: string, outputs: string) {
  const readme = await readFile(README_MD, { encoding: "utf8" });

  let updatedReadme = readme;

  updatedReadme = updatedReadme.replace(
    /<!-- start example -->.*<!-- end example -->/s,
    `<!-- start example -->\n${example}\n<!-- end example -->`,
  );

  updatedReadme = updatedReadme.replace(
    /<!-- start inputs -->.*<!-- end inputs -->/s,
    `<!-- start inputs -->\n${inputs}\n<!-- end inputs -->`,
  );

  updatedReadme = updatedReadme.replace(
    /<!-- start outputs -->.*<!-- end outputs -->/s,
    `<!-- start outputs -->\n${outputs}\n<!-- end outputs -->`,
  );

  await writeFile(README_MD, updatedReadme, { encoding: "utf8" });
}

function actionName() {
  let { repository: { url } } = packageJson;

  if (url.endsWith(".git")) {
    url = url.slice(0, -4);
  }

  const [user, repo] = new URL(url).pathname.split("/").filter(Boolean);

  return `${user}/${repo}`;
}

function* buildUsageExample(name: string, definition: ActionDefinition): Iterable<string> {
  yield "```yaml";
  yield `- uses: ${name}`;

  let hasRequiredInput = false;
  for (const inputName in definition.inputs) {
    const {
      required,
      default: defaultValue,
    } = definition.inputs[inputName];

    if (!required) {
      continue;
    }

    if (!hasRequiredInput) {
      hasRequiredInput = true;

      yield "  inputs:";
    }

    yield `    ${inputName}: ${yamlValue(defaultValue)}`;
  }

  yield "```";
}

function yamlValue(value: string) {
  const trueValue = ["true", "True", "TRUE"];
  const falseValue = ["false", "False", "FALSE"];

  if (trueValue.includes(value)) {
    return "true";
  }

  if (falseValue.includes(value)) {
    return "false";
  }

  return `"${value}"`;
}

function* buildInputsTable(definition: ActionDefinition): Iterable<string> {
  yield "Name | Description | Default";
  yield "-- | -- | --";

  for (const inputName in definition.inputs) {
    const {
      description,
      default: defaultValue,
    } = definition.inputs[inputName];

    yield `\`${inputName}\` | ${description} | \`${defaultValue}\``;
  }
}

function* buildOutputsTable(definition: ActionDefinition): Iterable<string> {
  yield "Name | Description | Example";
  yield "-- | -- | --";

  for (const inputName in definition.outputs) {
    const {
      description,
      example,
    } = definition.outputs[inputName];

    yield `\`${inputName}\` | ${description} | \`${example}\``;
  }
}
