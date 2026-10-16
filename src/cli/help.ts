export const help = (): string => `FlowTask — frozen acceptance fixture
Usage: flowtask <command> [options]
Global: --data <file> --json --now <ISO UTC timestamp> --help
init
project add --name <name> | list | archive <id>
task add --project <id> --title <title> | list | show <id> | update <id>
task done <id> | cancel <id> | block <id> <dependency> | unblock <id> <dependency>
tag add --name <name> | rm <id> | list
view save --name <name> [--filter <JSON>] [--sort <field>] | list | run <id>
export [--format json|csv] | import --file <path> [--format json|csv]
report <counts|overdue|upcoming-7-days|completion-per-day|dependency-graph> [--from <date> --to <date>]
serve [--port <number>] [--stdio]
Task fields: --description --status --priority --due <date|null> --tags <ids>
             --blocked-by <ids> --recurrence <JSON|null>
Task list: --project --status --ready --filter <JSON> --sort <priority|dueDate|createdAt|title>
`
