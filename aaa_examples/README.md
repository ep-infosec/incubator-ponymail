# AAA Examples
This directory contains example AAA (Authentication, Authorization and Access)
libraries for various use cases. 

To activate one of these scripts (or derivatives thereof), simply copy the appropriate
AAA script to `site/api/lib/aaa_site.lua`.
This will then be used by the main aaa.lua script.

These scripts require that
`site/api/lib/config.lua` has one or more OAuth providers specified as
authorities, as such:

~~~
...,
-- Use Google OAuth as an authority
admin_oauth = { "www.googleapis.com" }
...
~~~

### AAA by email address:
[`aaa_by_email_address.lua`](aaa_by_email_address.lua) checks against a GLOB
(`valid_email`), and if a logged-in user's email address matches this, provides
access to private lists, provided the OAuth provider used is listed in
`config.lua` as a valid authority.


### AAA by OAuth portal:
[`aaa_by_portal.lua`](aaa_by_portal.lua) checks which OAuth portal was used to
log in. If it's the right (Google in the example), then access to private lists
is granted.


### AAA with access list:
[`aaa_with_subgroups.lua`](aaa_with_subgroups.lua) checks validated accounts
against an access list, and if found, provides access to a specific set of
lists for each individual user.
