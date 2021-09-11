if exists('b:current_syntax')
  finish
endif

syn match dpsFileDirectory '^.\+/$'

hi! def link dpsFileDirectory Directory

let b:current_syntax = 'dps_file'

