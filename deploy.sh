#!/bin/bash
cd `dirname $0`
rsync -r . find1.dyndns.org:public_html/reporter

