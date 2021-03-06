import { Denops } from "https://deno.land/x/denops_std@v1.10.0/mod.ts";
import {
  buffers,
  globals,
} from "https://deno.land/x/denops_std@v1.10.0/variable/mod.ts";
import {
  ensureNumber,
  ensureString,
} from "https://deno.land/x/unknownutil@v1.1.0/mod.ts";
import { batch } from "https://deno.land/x/denops_std@v1.10.0/batch/mod.ts";
import * as autocmd from "https://deno.land/x/denops_std@v1.10.0/autocmd/mod.ts";

export async function main(d: Denops) {
  d.dispatcher = {
    async init(): Promise<void> {
      var path = await d.call("resolve", await d.call("expand", "%:p"));
      ensureString(path);
      if (!(await isDirectory(d, path))) {
        return;
      }
      var dir = await d.call("fnamemodify", path, ":p:gs!\\!/!");
      ensureString(dir);
      if ((await isDirectory(d, dir)) && !/\/$/.test(dir)) {
        dir = dir + "/";
      }

      await buffers.set(d, "dps_file_dir", dir);
      await batch(d, async (d) => {
        await d.cmd("setlocal modifiable");
        await d.cmd(
          "setlocal filetype=dps_file buftype=nofile bufhidden=unload nobuflisted noswapfile",
        );
        await d.cmd("setlocal nowrap cursorline");
      });

      // get files
      var files: string[] = [];
      for await (const item of Deno.readDir(path)) {
        files.push(name(item));
      }

      var isShowHidden = await globals.get(d, "dps_file_show_hidden") ?? false;
      if (!isShowHidden) {
        // 隠しファイルを除外
        files = files.filter((str) => /^[^\.]/.test(str));
      }

      await d.cmd(
        `silent keepmarks keepjumps call setline(1, [${
          files.map((str) => '"' + str + '"')
        }])`,
      );
      await d.cmd("setlocal nomodified nomodifiable");
    },

    async open(): Promise<void> {
      await edit(
        d,
        await d.call(
          "fnameescape",
          (await buffers.get(d, "dps_file_dir") as string) +
            (await d.call("getline", ".") as string).replace(/\/$/, ""),
        ),
      );
    },

    async up(): Promise<void> {
      var dir = await buffers.get(d, "dps_file_dir");
      ensureString(dir);
      dir = dir.replace(/\/$/, "");
      var name = await d.call("fnamemodify", dir, ":t:gs!\\!/!");
      if (name == "") {
        return;
      }
      dir = await d.call("fnamemodify", dir, ":p:h:h:gs!\\!/!");
      ensureString(dir);
      await edit(d, await d.call("fnameescape", dir));
      await d.call(
        "search",
        "\\v^\\V" + (await d.call("escape", name, "\\")) + "/\\v$",
        "c",
      );
    },

    async home(): Promise<void> {
      await edit(
        d,
        await d.call(
          "fnameescape",
          ((await d.call(
            "fnamemodify",
            (await d.call("expand", "~")),
            ":p:gs!\\!/!",
          )) as string).replace(/\/$/, ""),
        ),
      );
    },

    async reload(): Promise<void> {
      await edit(d, "");
    },

    async toggle_hidden(): Promise<void> {
      await globals.set(
        d,
        "dps_file_show_hidden",
        !((await globals.get(d, "dps_file_show_hidden")) ?? false),
      );
    },
  };

  await autocmd.group(d, "_dps_file_", (helper) => {
    helper.define(
      "BufEnter",
      "*",
      `call denops#request('${d.name}', 'init', [])`,
    );
  });
  await d.call("g:denops#request", d.name, "init", []);
}

const isDirectory = async (denops: Denops, path: string): Promise<boolean> => {
  var i = await denops.call("isdirectory", path);
  ensureNumber(i);
  return i != 0;
};

const name = (item: Deno.DirEntry): string => {
  var isDir = false;
  if ((item.isSymlink && item.isDirectory) || item.isDirectory) {
    isDir = true;
  }
  return item.name + (isDir ? "/" : "");
};

// try\n edit /\nendtry でautocmdが発火しないのでワークアラウンド
// thanks > @kuuote
const edit = async (denops: Denops, path: unknown): Promise<void> => {
  ensureString(path);
  await denops.cmd(`call feedkeys(":\\<C-u>edit ${path}\\<CR>")`);
};
