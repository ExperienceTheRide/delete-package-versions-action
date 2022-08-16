import core from '@actions/core'
import github from '@actions/github'

const getData = async () => {
    const token = core.getInput('PACKAGE_TOKEN');
    const matcherString = core.getInput('matchers');
    const matchers = matcherString.split('/')
    const octokit = github.getOctokit(token)
    const owner = github.context.repo.owner
    const repo = github.context.repo.repo

    try {
        console.log('Getting package list.')
        const res = await octokit.request('GET /orgs/{org}/packages/{package_type}/{package_name}/versions', {
            package_type: 'npm',
            package_name: repo,
            org: owner
        })
        const toDelete = []
        matchers.forEach(m => {
            toDelete.push(...res.data.filter(e => e.name.includes(m)))
        })
        if (toDelete.length > 0) {
            console.log('Deleting packages.')
            toDelete.forEach(async e => {
                await octokit.request('DELETE /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}', {
                    package_type: 'npm',
                    package_name: repo,
                    org: owner,
                    package_version_id: e.id
                })
                console.log(`Deleted: ${e.name}`)
            })
            console.log('Package deletion complete.')
        } else {
            console.log('No packages found for given matchers.')
            console.log('Exiting.')
        }
    } catch (e) {
        core.setFailed(e.message)
    }
}

getData()