import React from 'react';
import * as dom from 'react-dom';
import { AppBarX } from './appbar'

function boot () {
  const root = document.getElementById('root')
  dom.render(<AppBarX />, root)
}

debugger
boot()