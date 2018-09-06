// Awesome Image Compressor, by Naoya Watanabe <hello@showandtell.jp>
// This plugin compresses PNG and JPG assets using pngquant and jpegoptim right after they're exported from Sketch.
// 
// [GitHub](https://github.com/naoyawatanabe/awesome-image-compressor)
// If you have questions, comments or any feedback, file an issue on Github.
//
// pngquant © 2009-2018 by Kornel Lesiński.
// jpegoptim © 1996-2018  Timo Kokkonen <tjko@iki.fi>
//

const { execSync } = require('@skpm/child_process')
const toArray = require('sketch-utils/to-array')
const UI = require('sketch/ui')

const fileType = {
  png: {
    extension: 'png',
    compressor: pngquant()
  },
  jpg: {
    extension: 'jpg',
    compressor: jpegoptim()
  }
}

export function onExportSlices(context) {
  const exportRequests = toArray(context.actionContext.exports)
  compressSlices(exportRequests, fileType.png)
  compressSlices(exportRequests, fileType.jpg)
}

function compressSlices(exportRequests, fileType) {
  const targetPaths = exportRequests
    .filter(currentExport => currentExport.request.format() == fileType.extension)
    .map(currentExport => String(currentExport.path))
    .map(currentExport => String(currentExport.replace(/\\/g, '\\\\')))

  if (targetPaths.length === 0) {
    return
  }

  const targetDesc = `${targetPaths.length} ${fileType.extension} file${ targetPaths.length == 1 ? '' : 's' }`

  execSync(`${fileType.compressor} "${targetPaths.join('" "')}"`)
  UI.message(`Compressed ${targetDesc}`)
}

function pngquant() {
  const pngquantPath = context.plugin.urlForResourceNamed('node_modules/pngquant-bin/vendor/pngquant').path()
  return pngquantPath.replace(/ /g, '\\ ') + ' --ext .png -f'
}

function jpegoptim() {
  const jpegoptimPath = context.plugin.urlForResourceNamed('node_modules/jpegoptim-bin/vendor/jpegoptim').path()
  return jpegoptimPath.replace(/ /g, '\\ ') + ' --max=80'
}