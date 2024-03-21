#!/usr/bin/env python3

import os

os.system("tsc -p tsconfig.json")

CLIENT_CSS = open("src/client/story.css").read().replace("`", "\\`")
CLIENT_JS = open("src/client/story.js").read().replace("`", "\\`").replace("$", "\\$")

with open("dist/story.js", "r+") as f:
    contents = f.read()

with open("dist/story.js", "w") as f:
    f.write(
        contents.replace("{CLIENT_CSS_REPLACE_ME}", CLIENT_CSS).replace(
            "{CLIENT_JS_REPLACE_ME}", CLIENT_JS
        )
    )
