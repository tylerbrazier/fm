#!/bin/sh

url='http://localhost:8080'
# https://stackoverflow.com/a/29835459
this_dir=$(dirname "$(readlink -f -- "$0")")
cmd="node '$this_dir/server.js'"
os="$(uname -o)"

if [ "$os" = "Android" ]; then
	exe_dir="$HOME/.shortcuts"
	cmd="$cmd &\npid=\$!"
	cmd="$cmd\necho 'Opening $url...'"
	cmd="$cmd\ntermux-open-url '$url'"
	cmd="$cmd\nwait \$pid"
fi
if [ -z "$exe_dir" ]; then
	echo "This OS isn't supported yet." >&2
	exit 1
fi
mkdir -p "$exe_dir"

exe="$exe_dir/fm"
echo "$cmd" > "$exe"
chmod +x "$exe"
echo "Created/updated: $exe"
