# @dataplan/pg example

> [!WARNING]  
> Destroys and recreates a local database called `dataplanpg-example`.

Assuming you have postgres running locally with trust authorization, run:

```
yarn
yarn resetdb # WARNING: destroys and creates a database!
yarn start
```

> [!NOTE]
> The TypeScript types are currently problematic, I'm working on that. The code
> works though!
