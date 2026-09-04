OpenLMS frontend-plugin-notifications
######################################

|license-badge| |status-badge| |ci-badge|

.. |license-badge| image:: https://img.shields.io/badge/license-AGPL-informational
    :target: https://github.com/opswerks-swg/OpenLMS-frontend-plugin-notifications/blob/main/LICENSE
    :alt: License

.. |status-badge| image:: https://img.shields.io/badge/Status-Maintained-brightgreen

.. |ci-badge| image:: https://github.com/opswerks-swg/OpenLMS-frontend-plugin-notifications/actions/workflows/ci.yml/badge.svg
    :target: https://github.com/opswerks-swg/OpenLMS-frontend-plugin-notifications/actions/workflows/ci.yml
    :alt: Continuous Integration

Purpose
=======

This repository hosts ``@edx/frontend-plugin-notifications``, the OpenLMS
notifications tray. It is a **header widget**, not a standalone MFE: MFEs import
``NotificationsTray`` (or the package default) from the shared header. Do not
register ``headerApp`` from ``@openedx/frontend-base`` in this package — that
pulls ``@edx/frontend-component-header``, which this plugin does not depend on.

The live tray is a **drawer shell** (bell, header, mark-all, empty list). List
UI components (``NotificationTabs``, ``NotificationSections``, ``NotificationRowItem``)
remain in the tree for a future remount but are not wired into the shell today.

Integration
===========

OpenLMS mounts the tray from ``frontend-component-header`` via
``HeaderNotificationsSlot``. Classic LMS pages use a vanilla JS + SCSS mirror in
the Indigo theme (``notifications.js`` + ``_header.scss``).

Getting Started
===============

Installation
------------

The header package depends on this plugin via a local ``file:`` path::

    "@edx/frontend-plugin-notifications": "file:../frontend-plugin-notifications"

Import in the header notifications slot::

    import NotificationsTray from '@edx/frontend-plugin-notifications';

Local Development
-----------------

Clone this repository and install dependencies::

    npm install
    npm run build

The optional ``npm run dev`` playground loads **this plugin only** (no Open edX
header/footer apps). For MFE work, consume the package from the header webpack
alias as in OpenLMS ``just header-setup``.

Build and Test
--------------

::

    npm run build
    npm test
    npm run lint

License
=======

The code in this repository is licensed under the AGPLv3 unless otherwise
noted.

Please see `LICENSE <LICENSE>`_ for details.

Contributing
============

Contributions are welcome. Open an issue or pull request on GitHub.

Reporting Security Issues
=========================

Please do not report security issues in public. Contact the OpenLMS maintainers
through the repository issue tracker.
