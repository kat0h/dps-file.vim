nnoremap <silent> <plug>(dps-file-open)          :<c-u>call denops#request('dps-file', 'open', [])<cr>
nnoremap <silent> <plug>(dps-file-up)            :<c-u>call denops#request('dps-file', 'up', [])<cr>
nnoremap <silent> <plug>(dps-file-reload)        :<c-u>call denops#request('dps-file', 'reload', [])<cr>
nnoremap <silent> <plug>(dps-file-home)          :<c-u>call denops#request('dps-file', 'home', [])<cr>
nnoremap <silent> <plug>(dps-file-toggle-hidden) :<c-u>call denops#request('dps-file', 'toggle_hidden', [])<cr>

if !hasmapto('<plug>(dps-file-open)')
  nmap <buffer> <cr> <plug>(dps-file-open)
endif
if !hasmapto('<plug>(dps-file-up)')
  nmap <buffer> - <plug>(dps-file-up)
endif
if !hasmapto('<plug>(dps-file-reload)')
  nmap <buffer> \\ <plug>(dps-file-reload)
endif
if !hasmapto('<plug>(dps-file-home)')
  nmap <buffer> ~ <plug>(dps-file-home)
endif
if !hasmapto('<plug>(dps-file-toggle-hidden)')
  nmap <buffer> + <plug>(dps-file-toggle-hidden)<plug>(dps-file-reload)
endif
