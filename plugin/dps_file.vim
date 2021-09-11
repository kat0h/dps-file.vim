if exists('g:loaded_dps_file')
  finish
endif
let g:loaded_dps_file = 1

function! s:shutup_netrw() abort
  if exists('#FileExplorer')
    autocmd! FileExplorer *
  endif
  if exists('#NERDTreeHijackNetrw')
    autocmd! NERDTreeHijackNetrw *
  endif
endfunction

augroup _dps_file_
  autocmd!
  autocmd VimEnter * call s:shutup_netrw()
augroup END
