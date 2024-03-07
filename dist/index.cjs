'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

var React = require('react')
var jsxRuntime_cjs = require('./jsx-runtime.cjs')
var mdx = require('@mdx-js/react')

function _interopDefaultLegacy(e) {
  return e && typeof e === 'object' && 'default' in e ? e : { default: e }
}

function _interopNamespace(e) {
  if (e && e.__esModule) return e
  var n = Object.create(null)
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k)
        Object.defineProperty(
          n,
          k,
          d.get
            ? d
            : {
                enumerable: true,
                get: function () {
                  return e[k]
                },
              }
        )
      }
    })
  }
  n['default'] = e
  return Object.freeze(n)
}

var React__default = /*#__PURE__*/ _interopDefaultLegacy(React)
var mdx__namespace = /*#__PURE__*/ _interopNamespace(mdx)

/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

if (typeof window !== 'undefined') {
  window.requestIdleCallback =
    window.requestIdleCallback ||
    function (cb) {
      var start = Date.now()
      return setTimeout(function () {
        cb({
          didTimeout: false,
          timeRemaining: function () {
            return Math.max(0, 50 - (Date.now() - start))
          },
        })
      }, 1)
    }

  window.cancelIdleCallback =
    window.cancelIdleCallback ||
    function (id) {
      clearTimeout(id)
    }
}

/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */
/**
 * Renders compiled source from next-mdx-remote/serialize.
 */
function MDXRemote({
  compiledSource,
  frontmatter,
  scope,
  components = {},
  lazy,
}) {
  const [isReadyToRender, setIsReadyToRender] = React.useState(
    !lazy || typeof window === 'undefined'
  )
  // if we're on the client side and `lazy` is set to true, we hydrate the
  // mdx content inside requestIdleCallback, allowing the page to get to
  // interactive quicker, but the mdx content to hydrate slower.
  React.useEffect(() => {
    if (lazy) {
      const handle = window.requestIdleCallback(() => {
        setIsReadyToRender(true)
      })
      return () => window.cancelIdleCallback(handle)
    }
  }, [])
  const Content = React.useMemo(() => {
    // if we're ready to render, we can assemble the component tree and let React do its thing
    // first we set up the scope which has to include the mdx custom
    // create element function as well as any components we're using
    const fullScope = Object.assign(
      { opts: { ...mdx__namespace, ...jsxRuntime_cjs.jsxRuntime } },
      { frontmatter },
      scope
    )
    const keys = Object.keys(fullScope)
    const values = Object.values(fullScope)
    // now we eval the source code using a function constructor
    // in order for this to work we need to have React, the mdx createElement,
    // and all our components in scope for the function, which is the case here
    // we pass the names (via keys) in as the function's args, and execute the
    // function with the actual values.
    const hydrateFn = Reflect.construct(
      Function,
      keys.concat(`${compiledSource}`)
    )
    return hydrateFn.apply(hydrateFn, values).default
  }, [scope, compiledSource])
  if (!isReadyToRender) {
    // If we're not ready to render, return an empty div to preserve SSR'd markup
    return React__default['default'].createElement('div', {
      dangerouslySetInnerHTML: { __html: '' },
      suppressHydrationWarning: true,
    })
  }
  // wrapping the content with MDXProvider will allow us to customize the standard
  // markdown components (such as "h1" or "a") with the "components" object
  const content = React__default['default'].createElement(
    mdx__namespace.MDXProvider,
    { components: components },
    React__default['default'].createElement(Content, null)
  )
  // If lazy = true, we need to render a wrapping div to preserve the same markup structure that was SSR'd
  return lazy
    ? React__default['default'].createElement('div', null, content)
    : content
}

exports.MDXRemote = MDXRemote
