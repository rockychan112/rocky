// Import the SDK client
const Abstract = require("abstract-sdk")
const LibrariesData = require("./libraries-data.json")
const fs = require("fs")
const util = require("util")

// Custom abstract project
const orgId = "a5fa05af-cb79-4c67-9c27-899f7c43e26c"
const projectId = "14691130-2843-11e8-92ba-c7ead1b70b99"
const branchId = "master"
const commitSha = "latest"
const accessToken = process.argv[2]

// Create an abstract client
const abstract = new Abstract.Client({
  // Use the api
  transportMode: ["api"],
  accessToken: accessToken
});

// Functions
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const replaceXmlVersion = async (fileName, version) => {
  // Read XML
  let xml = await readFile(fileName, 'utf8')
  // replace version with regex
  xml = xml.replace(/(?<=(sparkle:version=")).*(?=")/g, version)
  // Write XML
  await writeFile(fileName, xml)
  console.log(fileName + ' version updated to ' + version)
}

async function run() {
  const fileList = await abstract.files.list(
    {
      projectId: projectId,
      branchId: branchId,
      sha: commitSha,
    }
  )

  const latestSha = fileList[0].sha
  console.log('The latest sha is ' + latestSha)

  if (latestSha == LibrariesData.sha) {
    console.log("No commit pushed since latest record")
  } else {
    LibrariesData.sha = latestSha
    const changedFile = fileList.filter(file => file.sha === file.lastChangedAtSha)

    if (changedFile) {
      // Download new file and update record
      await Promise.all(changedFile.map(async (file) => {
        let libraryRecord = LibrariesData.libraries.find(library => library.id == file.id)

        if (libraryRecord) {
          console.log(file.name + " has been changed")

          // Downlaod library file
          console.log("Downloading " + file.name)
          await abstract.files.raw({
            projectId: projectId,
            branchId: branchId,
            fileId: file.id,
            sha: commitSha,
          }, {
            onProgress: (receivedBytes, totalBytes) => {
              // console.log(`${receivedBytes * 100 / totalBytes}% complete`)
            }
          })

          // Increase library version
          libraryRecord.version++

          // Replace version in xml
          await replaceXmlVersion(libraryRecord.rss, libraryRecord.version)
        } else {
          console.log('No library chagned')
        }
      }))

      // Write to the libraries data file
      fs.writeFile('libraries-data.json', JSON.stringify(LibrariesData), (err) => {
        if (err) throw err;
        console.log("libraries-data.json is updated")
      })
    } else {
      console.log('No library chagned')
    }
  }
}

run();