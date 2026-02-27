"use babel";
import { CompositeDisposable } from "event-kit";
import { actions } from "inkdrop";
import axios from "axios";

const NAMESPACE = "pull-jira-tasks";
const ENVS = {
  token: "",
  filter_id: "",
  org_name: "",
};

/**
 * Retrieves environment variables from Inkdrop configuration
 * @throws {Error} If any required environment variable is not set
 */
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

/**
 * Fetches tasks from JIRA API using a filter ID
 * @returns {Promise<Array<{title: string, url: string}>>} Array of task objects
 */
const getTasks = () => {
  const { token, filter_id, org_name } = ENVS;
  return axios
    .get(
      `https://${org_name}.atlassian.net/rest/api/3/search/jql?jql=filter=${filter_id}&fields=*all`,
      {
        headers: {
          Authorization: `Basic ${token}`,
        },
      }
    )
    .then((response) => {
      return response.data.issues.map((issue) => {
        const issueKey = issue.key;
        const title = issue.fields.summary;
        return {
          title: title,
          url: `https://${org_name}.atlassian.net/browse/${issueKey}`,
        };
      });
    });
};

/**
 * Converts tasks array to markdown checklist format
 * @param {Array<{title: string, url: string}>} tasks - Array of task objects
 * @returns {string} Markdown formatted checklist
 */
const convertMarkdown = (tasks) => {
  let markdown = "";
  tasks.forEach((task) => {
    markdown += `- [ ] [${task.title}](${task.url})\n`;
  });
  return markdown;
};

/**
 * Main function to pull JIRA tasks and insert them into the current note
 * @async
 */
const pull = async () => {
  try {
    getENV();
    const tasks = await getTasks();
    const { editingNote } = inkdrop.store.getState();
    if (!editingNote) {
      throw new Error("editingNote is not found");
    }
    const { body } = editingNote;
    const markdown = convertMarkdown(tasks);
    inkdrop.store.dispatch(
      actions.editingNote.update({ body: body + "\n\n" + markdown })
    );
    inkdrop.store.dispatch(actions.editor.change(true));
    inkdrop.notifications.addInfo("JIRA tasks pulled successfully", {
      dismissable: true,
    });
  } catch (error) {
    inkdrop.notifications.addError(
      `Failed to pull JIRA tasks: ${error.message}`,
      {
        dismissable: true,
      }
    );
  }
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
    filter_id: {
      title: "Filter ID",
      description: `Please obtain the ID of the filter you want to use from the URL below: https://{your org name}.atlassian.net/issues/?filter={filter_id}`,
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
