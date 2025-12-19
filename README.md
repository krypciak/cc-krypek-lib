<!-- markdownlint-disable MD013 MD024 MD001 MD045 -->

# cc-krypek-lib

<!-- [![CCModManager badge](https://raw.githubusercontent.com/CCDirectLink/CCModManager/refs/heads/master/icon/badge.png)](https://github.com/CCDirectLink/CCModManager) -->

# For mod developers

## New steps

### `ig.EVENT_STEP.LOG`

Prints a message to the console.  
The vanilla step `ig.EVENT_STEP.CONSOLE_LOG` exists, but it uses `ig.log`, `ig.warn` and `ig.error` for printing,  
and since these functions are empty, the step does nothing.  

Settings:
- `text` (`ig.Event.StringExpression`) - the text to print, not necessarily a string
- `logType` (`log` | `warn` | `error`) (optional, default = `log`) - log type

Examples:  
```json
{ "type": "LOG", "text": "normal message" },
{ "type": "LOG", "text": { "varName": "tmp.varContainingMyMessage" } },
{ "type": "LOG", "text": true },
{ "type": "LOG", "text": "normal message", "logType": "log" },
{ "type": "LOG", "text": "warn message!", "logType": "warn" },
{ "type": "LOG", "text": "error message!", "logType": "error" },
```

## Step macros

Step macros enable reusing steps across different files.  
The steps below are not real steps, they will get removed/replaced with different steps during step parsing.  
Step macros can be called from both `ig.ACTION_STEP` and `ig.EVENT_STEP` contexts,
but calling an step macro that contains `ig.ACTION_STEP` steps in the `ig.EVENT_STEP` context (and the other way around) will result in a crash!  
You can call `DEFINE_MACRO` and `MACRO` in any place where there are steps.  

### `DEFINE_MACRO`

Settings:
- `name` (`string`) - macro name
- `steps` - array of steps, the macro body
- `args` (`string[]`) (optional) - what arguments are required when calling the macro
- `argsDefault` (`Record<string, any>`) (optional) - default values for arguments when they are not set explicitly.  
   If a default argument value contains the string `@UNIQUE`, the first string `@UNIQUE` gets replaced with an global unique counter.  
   This allows for avoiding label name conflicts.
- `argsDepth` (`number`) (optional) - how deep should the variable replacer look for variables to replace

After a macro is defined, all subsequent `DEFINE_MACRO` calls that define a macro with the same name will be silently ignored.  

### Step macro files

Calling a macro that has not yet been defined will result in an error!  
For example, if you define a macro in a map `rhombus-dng/my-new-room1` and attempt to call it in `rhombus-dng/my-new-room2` without first loading the `rhoubms-dng/my-new-room1` map, the game will crash!  
A solution to this problem are step macro files.  
Step macro files are loaded at the game's startup, so you can use them wherever you want, without worring about the load order.  
If you call one macro inside of another macro, you don't worry about the step macro file load order, as the macro body is evaluated at the time of calling it.  

Step macro files are located under `assets/data/step-macros`.  
Create a `.json` file with whatever name you want (the name doesn't affect anything).  
You can define multiple macros in one step macro file.
Example file contents:
```json
[
    {
        "name": "my_macro",
        "steps": [
            { "type": "LOG", "text": "someone called my_macro!!!" }
        ]
    },
    {
        "name": "my_macro_with_argument",
        "argsDefault": {
            "message": "welcome!"
        },
        "steps": [
            { "type": "LOG", "text": "message" }
        ]
    },
    {
        "name": "my_macro_with_steps_arguemnt",
        "args": ["steps"],
        "steps": [
            { "type": "LOG", "text": "second marco start!" },
            "steps",
            { "type": "LOG", "text": "second marco end!" }
        ]
    }
]
```

### `MACRO`

Here's how you call a macro:
```json
{ "type": "MACRO", "name": "my_macro" },

{ "type": "COMMENT", "text": "a comment that will get removed" },
{ "type": "LOG", "text": "LOG between macro calls for illustrative purposes"}

{ "type": "MACRO", "name": "my_macro_with_argument" },
{ "type": "MACRO", "name": "my_macro_with_argument", "message": "bye!" },

{ "type": "LOG", "text": "LOG between macro calls for illustrative purposes"}

{ "type": "MACRO", "name": "my_second_macro", "steps": [
    { "type": "LOG", "text": "im in the body of my_second_macro!!!" }
] },
```
When the steps are parsed, it gets replaced with the macro's steps:
```json
{ "type": "LOG", "text": "someone called my_macro!!!" },

{ "type": "LOG", "text": "LOG between macro calls for illustrative purposes" },

{ "type": "LOG", "text": "welcome!" },
{ "type": "LOG", "text": "bye!" },

{ "type": "LOG", "text": "LOG between macro calls for illustrative purposes" },

{ "type": "LOG", "text": "my_macro_with_steps_arguemnt start!" },
{ "type": "LOG", "text": "im in the body of my_macro_with_steps_arguemnt!!!" },
{ "type": "LOG", "text": "my_macro_with_steps_arguemnt end!" },
```

### `COMMENT`

`COMMENT` is not a macro, but it behaves similarly to one.  
During step parsing, all comments are removed, as if they were never there in the first place.  

Examples:
```json
{ "type": "COMMENT", "argument names dont matter here": "neither do the values" },
{ "type": "COMMENT", "text": "the step below insta kills the player." },
{
    "type": "DO_ACTION",
    "entity": { "player": true },
    "action": [
        { "type": "REDUCE_HP", "basedOn": "MAX_HP", "factor": 1 }
    ]
},
```

### `FOR`

`FOR` is a built-in macro, however it is not special in any way, meaning you can define a identical macro to `FOR` in your mod.  
You can peek at it's implementation [here](/assets/data/step-macros/for.json).  

Arguments:
- `from` (optional, default = `0`) - start the for loop at
- `to` - end the for loop at
- `i` (optional) - what index variable to use
- `loopName` (optional) - override the loop start label (useful when you want to end the loop early)
- `steps` - steps to execute

This is what it would look like if converted to javascript code:
```javascript
loopName:
for (let i = from; i < to; i++) {
    // steps
}
```

Examples:
```json
{ "type": "COMMENT", "text": "this will print numbers 3-9" },
{ "type": "MACRO", "name": "FOR", "i": "tmp.index", "from": 3, "to": 10, "steps": [
    { "type": "LOG", "text": { "varName": "tmp.index" } }
] },
```
```json
{ "type": "COMMENT", "text": "this will print numbers 0-9" },
{ "type": "CHANGE_VAR_NUMBER", "changeType": "set", "varName": "tmp.to", "value": 10 },
{ "type": "MACRO", "name": "FOR", "i": "tmp.index", "to": "tmp.to", "steps": [
    { "type": "LOG", "text": { "varName": "tmp.index" } }
] },
```


## Variable object access fix

The base game doesn't allow returning the object themselves when the variable is accessed with `ig.Vars#resolveObjectAccess`.  
For example, in vanilla:
```javascript
ig.vars.get("player.entity.pos") // undefined
```
But with `cc-krypek-lib`:
```javascript
ig.vars.get("player.entity.pos") // {x: 919, y: 1135, z: 16}
```
This allows for some powerful techniques to be used, for example:
```json
{ "type": "COMMENT", "text": "this will teleport the party member to the player" },
{ "type": "COMMENT", "text": "without cc-krypek-lib, this would crash the game!" },
{
    "type": "DO_ACTION",
    "entity": { "party": "Member2" },
    "action": [
        { "type": "SET_POS", "newPos": { "varName": "player.entity.pos" } }
    ]
},
```

## Arrays

The base game has a very limited support for variable arrays, `cc-krypek-lib` expands that support with the new event step:

### `ig.EVENT_STEP.CHANGE_VAR_ARRAY`

Performs an operation on an array.  

Settings:
- `varName` (`ig.Event.VariableExpression`) - variable name to modify
- `changeType` (`set` | `push` | `erase` | `intersect` | `filterUnique`) - type of operation to perform
- `value` (`ig.Event.ArrayExpression`) (optional in `filterUnique`) - array value

Operations:
- `set` - sets `varName` to the array `value`
- `push` - appends the array `varName` with values from the array `value`
- `erase` - erases the values in the array `varName` that appear in the array `value`
- `intersect` - erases all values in the array `varName` that don't appear in both the array `varName` and in the array `value`
- `filterUnique` - erases all duplicate values in the array `varName`, so that only unique values remain

Examples:
```json
{ "type": "COMMENT", "text": "after this, tmp.numbers is [0]" },
{ "type": "CHANGE_VAR_ARRAY", "changeType": "set", "varName": "tmp.numbers", "value": [0] },

{ "type": "COMMENT", "text": "after this, tmp.numbers is [0, 1, 2]" },
{ "type": "CHANGE_VAR_ARRAY", "changeType": "push", "varName": "tmp.numbers", "value": [1, 2] }, 

{ "type": "COMMENT", "text": "after this, tmp.numbers is [0, 1, 2, 0, 1, 2]" },
{ "type": "CHANGE_VAR_ARRAY", "changeType": "push", "varName": "tmp.numbers", "value": { "varName": "tmp.numbers" } }, 

{ "type": "COMMENT", "text": "will print 6" },
{ "type": "LOG", "text": { "varName": "tmp.numbers.length" } },

{ "type": "COMMENT", "text": "will print 1" },
{ "type": "LOG", "text": { "varName": "tmp.numbers[4]" } },

{ "type": "COMMENT", "text": "will print 2" },
{ "type": "CHANGE_VAR_NUMBER", "changeType": "set", "varName": "tmp.index", "value": 5 },
{ "type": "LOG", "text": { "varName": "tmp.numbers[tmp.index]" } },

{ "type": "COMMENT", "text": "will print 1" },
{ "type": "LOG", "text": { "varName": "tmp.numbers[1]" } },

{ "type": "COMMENT", "text": "after this, tmp.numbers is [0, 2, 0, 2]" },
{ "type": "CHANGE_VAR_ARRAY", "changeType": "intersect", "varName": "tmp.numbers", "value": [0, 2, 4] }, 

{ "type": "COMMENT", "text": "after this, tmp.numbers is [0, 2]" },
{ "type": "CHANGE_VAR_ARRAY", "changeType": "filterUnique", "varName": "tmp.numbers" }, 

{ "type": "COMMENT", "text": "after this, tmp.numbers is [2]" },
{ "type": "CHANGE_VAR_ARRAY", "changeType": "erase", "varName": "tmp.numbers", "value": [0] }, 
```

## Entity var access

`cc-krypek-lib` adds the following read-only variables:
- `game.entities.all` - returns an array of all entities on a map
- `game.entities.allShown` - returns an array of all visible entities on a map
- `game.entities.type.ENTITY_TYPE` - returns an array of all entities with the type of `ENTITY_TYPE`
- `game.entities.standingOn.ENTITY_NAME` - returns an array of all entities that are currently standing on the entity named `ENTITY_NAME`
- `game.entities.name.ENTITY_NAME` - returns an entity named `ENTITY_NAME`

In addition, when you select an entity (places where `{ "player": true }` is used for example), you can now also select an entity from a variable, using the `"expr"` selector.  
For example: `{ "expr": { "varName": "player.entity" } }` is equivalent to `{ "player": true }`.  
Another example: `{ "expr": { "varName": "tmp.my_entity" } }` gets the entity from the variable `tmp.my_entity`.  

Examples:
```json
{ "type": "COMMENT", "text": "print the count of all entities on the map" },
{ "type": "LOG", "text": { "varName": "game.entities.all.length" } },
```

```json
{ "type": "COMMENT", "text": "this will teleport the player to the marker named my_marker_name" },
{
    "type": "DO_ACTION",
    "entity": { "player": true },
    "action": [
        { "type": "SET_POS", "newPos": { "varName": "game.entities.name.my_marker_name.pos" } }
    ]
},
```
```json
{ "type": "COMMENT", "text": "this will teleport all actor entities on the map to the player" },
{ "type": "CHANGE_VAR_ARRAY", "changeType": "set", "varName": "tmp.entities", "value": { "varName": "game.entities.type.ActorEntity" } },
{ "type": "MACRO", "name": "FOR", "i": "tmp.i", "to": "tmp.entities.length", "steps": [
    {
        "type": "DO_ACTION",
        "entity": { "expr": { "varName": "tmp.entities[tmp.i]" } },
        "action": [
            { "type": "SET_POS", "newPos": { "varName": "player.entity.pos" } }
        ]
    }
] },
```

## Other new steps

### `ig.EVENT_STEP.SET_VAR`

Directly sets a variable using the `ig.vars.set` call.  
This is different from the vanilla `CHANGE_VAR_*` as this does not care about what the value is.  
That allows storing things like entities as variables.  

Settings:
- `varName` (`ig.Event.VariableExpression`) - variable name to set
- `value` (`ig.Event.VarExpression`) - value to set, can be of any type

Examples:
```json
{ "type": "SET_VAR", "varName": "tmp.myvar", "value": true },
{ "type": "SET_VAR", "varName": "tmp.myothervar", "value": { "varName": "tmp.myvar" } },

{ "type": "SET_VAR", "varName": "tmp.entity", "value": { "varName": "player.entity" } },
{ "type": "COMMENT", "text": "this will print the players head item id" },
{ "type": "LOG", "text": { "varName": "tmp.entity.model.equip.head" } },
```


### `ig.EVENT_STEP.RUN_JS_FUNCTION`

Runs a javascript function.  
Useful when constructing and running an event step from other javascript code.  
I don't recommend using this for purposes other than debugging and the use case above!  

Settings:
- `func` (`string` | `Function`) - the function to run. Supports returning promises

Examples:  
```json
{ "type": "COMMENT", "text": },
{ "type": "RUN_JS_FUNCTION", "func": "location.reload()" },
```

### `ig.EVENT_STEP.FORCE_LEVEL_UP`

Adds 1000 experience (1 level) to the player.  
If the player is already level 99, it first sets the player level to 98.  

Settings: None  

Example:  
```json
{ "type": "FORCE_LEVEL_UP" },
```

### `ig.EVENT_STEP.ASSIGN_VEC2`

Assign a `Vec2` to a variable.  
This differs from `CHANGE_VAR_VEC2` with the `"changeType": "set"` flag,  
since the vanilla step sets the variable by reference,  where this step copies the vector indices.

Settings: 
- `varName` (`ig.Event.VariableExpression`) - variable name to set
- `value` (`ig.Event.Vec2Expression`) - vector value

Example:
```json
{ "type": "ASSIGN_VEC2", "varName": "tmp.vec2", "value": { "varName": "tmp.vec1" } },
```

### `ig.EVENT_STEP.ASSIGN_VEC3`

Same as above step but for `Vec3`.

### `ig.EVENT_STEP.SHOW_INPUT_DIALOG`

Shows a text input dialog popup, with configurable restrictions for the text input, and saves the text to a variable.  

Settings:
- `width` (`number`) (optional, default = `200`)
- `title` (`ig.Event.StringExpression`) - title of the popup
- `initialValue` (`ig.Event.StringExpression`) (optional) - initial text field value
- `saveToVar` (`ig.Event.VariableExpression`) (optional) - save the text to a variable
- `validRegex` (`ig.Event.StringExpression`) (optional) - regex for validating the text input
- `validFunction` (`Function`) (optional) - mutually exclusive with `validRegex`, can only be used when calling from other javascript code, function for validating the text input
- `accepted` (`ig.EventStepBase.Settings[]`) (optional) - steps to run when the text was valid and popup was accepted 
- `declined` (`ig.EventStepBase.Settings[]`) (optional) - steps to run when the popup was rejected

Example:
```json
{ 
    "type": "SHOW_INPUT_DIALOG",
    "width": 300,
    "title": "What's your favorite CrossCode class?",
    "initialValue": "spheromancer",
    "saveToVar": "tmp.answer",
    "validRegex": "^(spheromancer|hexacast|triblader|quadroguard|pentafist)$",
    "accepted": [
        { "type": "COMMENT", "text": "steps to run when accepted"}
    ],
    "rejected": [
        { "type": "COMMENT", "text": "steps to run when rejected"}
    ]
}
```

### `ig.EVENT_STEP.SET_ARRAY_REGULAR_POLYGON_VERTICES`

Create an array of `Vec2` that represents the positions of vertecies of a n-sided regular polygon relative to the shape's center.

Settings:
- `varName` (`ig.Event.VariableExpression`) - variable name to store the array in
- `size` (`ig.Event.NumberExpression`) - number of sides
- `radius` (`ig.Event.NumberExpression`) - the distance of each point from the shape's center
- `rotation` (`ig.Event.NumberExpression`) (optional, default = `0`) - point rotation

Example:
```json
{
    "type": "SET_ARRAY_REGULAR_POLYGON_VERTICES",
    "varName": "tmp.circlePositions",
    "size": { "varName": "tmp.circlePointCount" },
    "radius": 20 
},
```

## Building

```bash
git clone https://github.com/krypciak/cc-krypek-lib
cd cc-krypek-lib
pnpm install
pnpm run start
# this should return no errors (hopefully)
pnpm tsc
```
