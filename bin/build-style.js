#!/usr/bin/env node
'use strict';

const {Glob} = require('glob')
const fs     = require('fs-extra');
const path   = require('path');

const MONOREPO_DIR = path.resolve(__dirname, '..').replace(/\\/g, '/');
const PACKAGES_DIR = path.resolve(__dirname, '../packages').replace(/\\/g, '/');

const stylesheetEntryPoints = path.resolve(PACKAGES_DIR, '*/src/*/*.scss');

const packageStyles = new Glob(stylesheetEntryPoints, {withFileTypes : true})

packageStyles.stream().on('data', current => {

    const component = current.parent.name;
    const abs_from  = current.fullpath();

    const abs_to = path.resolve(current.fullpath(), `../../../build-style/${component}.scss`)

    const rel_from = path.relative(MONOREPO_DIR, abs_from)
    const rel_to   = path.relative(MONOREPO_DIR, abs_to)

    fs.copy(rel_from, rel_to);

})