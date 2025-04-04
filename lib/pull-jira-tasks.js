"use babel";
import { CompositeDisposable } from "event-kit";
import { actions } from "inkdrop";
import axios from "axios";

const NAMESPACE = "pull-jira-tasks";
const ENVS = {
  token: "",
  jql_query: "",
  org_name: "",
};

const getENV = () => {
  Object.keys(ENVS).forEach((name) => {
    ENVS[name] = inkdrop.config.get(`${NAMESPACE}.${name}`);
    if (ENVS[name] === undefined) {
      inkdrop.notifications.addError(
        `${name} is not set. please set ${name}: Preferences > Plugins > pull-jira-tasks`,
        {
          dismissable: true,
        }
      );
      throw new Error(`${name} is not set`);
    }
  });
};

const getTasks = () => {
  const { token, jql_query, org_name } = ENVS;
  return axios
    .get(
      `https://${org_name}.atlassian.net/rest/api/3/search?jql=${jql_query}`,
      {
        headers: {
          Authorization: `Basic ${token}`,
        },
      }
    )
    .then((response) => {
      return response.data.issues.map((issue) => {
        const issueKey = issue.key;
        return {
          title: issue.fields.summary,
          url: `https://${org_name}.atlassian.net/browse/${issueKey}`,
        };
      });
    });
};

const converMarkdown = (tasks) => {
  let markdown = "";
  tasks.forEach((task) => {
    markdown += `- [ ] [${task.title}](${task.url})\n`;
  });
  return markdown;
};

const pull = async () => {
  getENV();
  const tasks = await getTasks();
  const { editingNote } = inkdrop.store.getState();
  if (!editingNote) {
    throw new Error("editingNote is not found");
  }
  const { body } = editingNote;
  const markdown = converMarkdown(tasks);
  inkdrop.store.dispatch(
    actions.editingNote.update({ body: body + "\n\n" + markdown })
  );
  inkdrop.store.dispatch(actions.editor.change(true));
};

module.exports = {
  config: {
    token: {
      title: "JIRA API Token",
      description: `Create JIRA API Token https://id.atlassian.com/manage-profile/security/api-tokens, 
        after creating the token, base64 encode it and set it here. 
        echo -n "your-email@example.com:your-api-token" | base64`,
      type: "string",
    },
    jql_query: {
      title: "JQL Query",
      description: `create query here, https://{{your org}}.atlassian.net/issues/.
        Paste the request parameters(jql) that were added to the URL after query creation.`,
      type: "string",
    },
    org_name: {
      title: "Organization Name",
      description: "Organization Name",
      type: "string",
    },
  },
  activate() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      inkdrop.commands.add(document.body, {
        "pull-jira-tasks:pull": () => pull(),
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },
};
