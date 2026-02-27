/**
 * Post-build cleanup for LLM documentation files.
 * Strips Docusaurus-specific syntax (JSX components, admonitions, etc.)
 * that isn't useful for LLM consumption.
 *
 * Usage: node scripts/clean-llm-files.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const BUILD_DIR = join(import.meta.dirname, '..', 'build')
const FILES = ['llms.txt', 'llms-full.txt']

/**
 * Cleanups safe to apply everywhere (including inside code blocks).
 */
function cleanGlobal(content) {
  return (
    content
      // Remove Docusaurus code block attributes (showLineNumbers, title)
      .replace(
        /^(```\w*)\s+(?:title="[^"]*"\s*)?(?:showLineNumbers\s*)?$/gm,
        '$1',
      )
      // Collapse 3+ consecutive blank lines to 2
      .replace(/\n{4,}/g, '\n\n\n')
  )
}

/**
 * Cleanups that must ONLY apply outside of fenced code blocks
 * to avoid mangling code examples.
 */
function cleanProse(text) {
  return (
    text
      // Remove Docusaurus theme imports
      .replace(/^import .+ from '@theme\/.*';\n?/gm, '')
      // Convert <TabItem label="..."> to a bold label, remove other Tabs markup
      .replace(/<\/?Tabs[^>]*>\n?/g, '')
      .replace(/<TabItem[^>]*label="([^"]*)"[^>]*>\n?/g, '**$1:**\n')
      .replace(/<TabItem[^>]*>\n?/g, '')
      .replace(/<\/TabItem>\n?/g, '')
      // Remove <details>/<summary> (keep inner content)
      .replace(/<details>\n?/g, '')
      .replace(/<\/details>\n?/g, '')
      .replace(/<summary>(.*?)<\/summary>\n?/g, '**$1**\n')
      // Convert admonitions to blockquote labels
      .replace(
        /^:::(tip|warning|note|danger|important|info)\n?/gm,
        (_, type) =>
          `> **${type.charAt(0).toUpperCase() + type.slice(1)}**: `,
      )
      .replace(/^:::\n?/gm, '\n')
      // Remove highlight markers
      .replace(/^\s*\/\/ highlight-(?:start|end|next-line)\n?/gm, '')
      // Remove markdown comments
      .replace(/^\[\/\/\]: # '.*?'\n?/gm, '')
      // Remove image references (local paths, not useful for LLMs)
      .replace(/^[ \t]*!\[.*?\]\(\/img\/.*?\)\n?/gm, '')
      // Remove inline img tags with local paths
      .replace(/^.*<img\s+src=\{?['"]\/img\/[^}]*\}?\s*[^>]*\/>\s*\n?/gm, '')
      // Clean up JSX expressions like {'>='} to just the text
      .replace(/\{'\s*(.*?)\s*'\}/g, '$1')
  )
}

/**
 * Split content into code-fenced and non-code-fenced segments,
 * apply prose cleanup only to non-code segments, then reassemble.
 */
function cleanContent(content) {
  const parts = content.split(/^(```\w*.*$)/gm)
  let insideCodeBlock = false
  const cleaned = parts.map((part) => {
    if (/^```\w*/.test(part)) {
      insideCodeBlock = !insideCodeBlock
      return part
    }
    return insideCodeBlock ? part : cleanProse(part)
  })

  return cleanGlobal(cleaned.join(''))
}

for (const file of FILES) {
  const filePath = join(BUILD_DIR, file)
  try {
    const content = readFileSync(filePath, 'utf-8')
    const cleaned = cleanContent(content)
    writeFileSync(filePath, cleaned)
    const reduction = (
      ((content.length - cleaned.length) / content.length) *
      100
    ).toFixed(1)
    console.log(
      `Cleaned ${file}: ${content.length} -> ${cleaned.length} bytes (${reduction}% reduction)`,
    )
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message)
  }
}
