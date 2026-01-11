# Ignore Overrides

## Description

Allow the agent to access certain files and folders that are in the .gitignore
file that are explicitly specified.

When reading these files, please confirm with the user that the agent wishes
to read or modify them.

## Motivation

The files below are workspace generated files important to tasks while using
the aplication and should not in general have secrets. Please respect all
other files listed in `.gitignore`.

## Rules

The agent is allowed to view files in these folders:

```
tmp
scrips
portfolio
```
