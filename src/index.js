import core from '@actions/core'
import github from '@actions/github'

const getData = async () => {
    const matcherString = core.getInput('matchers');
    const matchers = matcherString ? matcherString.split('/') : undefined
    const octokit = github.getOctokit(process.env.DELETE_PACKAGE_PAT)
    const owner = github.context.repo.owner
    const repo = github.context.repo.repo

    try {
        if (matchers) {
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
                return
            }
            console.log('No packages found for given matchers.')
            console.log('Exiting.')
            return
        }
        core.setFailed('No matchers given.')
    } catch (e) {
        core.setFailed(e.message)
    }
}

getData()