# pull-jira-tasks

An Inkdrop plugin that pulls JIRA tasks from a filter and inserts them as a markdown checklist into your current note.

## Features

- Pull JIRA tasks using a filter ID
- Automatically format tasks as markdown checklists
- Easy integration with Inkdrop notes
- Configurable JIRA API token and organization settings

## Installation

```bash
ipm install pull-jira-tasks
```

## Configuration

After installation, configure the plugin in Inkdrop:

1. Go to **Preferences** > **Plugins** > **pull-jira-tasks**
2. Set the following required fields:

### JIRA API Token

Create a JIRA API token at https://id.atlassian.com/manage-profile/security/api-tokens

After creating the token, encode it in base64 format:

```bash
echo -n "your-email@example.com:your-api-token" | base64
```

Paste the base64-encoded string into the **JIRA API Token** field.

### Filter ID

1. Go to your JIRA instance: `https://{your-org-name}.atlassian.net/issues/`
2. Create or select a filter
3. Copy the filter ID from the URL: `https://{your-org-name}.atlassian.net/issues/?filter={filter_id}`
4. Paste the filter ID into the **Filter ID** field

### Organization Name

Enter your JIRA organization name (the subdomain before `.atlassian.net`)

## Usage

1. Open a note in Inkdrop where you want to insert JIRA tasks
2. Right-click in the editor and select **Pull JIRA Tasks** from the context menu
   - Or use the menu: **Plugins** > **pull-jira-tasks** > **Pull**
3. The plugin will fetch tasks from your JIRA filter and insert them as a markdown checklist

## Example Output

```markdown
- [ ] [Implement user authentication](https://your-org.atlassian.net/browse/PROJ-123)
- [ ] [Fix bug in dashboard](https://your-org.atlassian.net/browse/PROJ-124)
- [ ] [Update documentation](https://your-org.atlassian.net/browse/PROJ-125)
```

## Publishing

After merging changes to main, publish using:

```bash
ipm publish minor
```

For more information, see the [Inkdrop plugin publishing guide](https://developers.inkdrop.app/guides/plugin-word-count#publishing).

## License

MIT - See [LICENSE.md](LICENSE.md) for details
