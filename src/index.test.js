import { jest } from '@jest/globals'

const coreMock = {
    getInput: jest.fn(),
    setFailed: jest.fn()
}

const githubMock = {
    getOctokit: jest.fn(),
    context: {
        repo: {
            owner: 'repo_owner_mock',
            repo: 'repo_name_mock'
        }
    }
}

const octokitMock = {
    request: jest.fn()
}

process.env.DELETE_PACKAGE_PAT = 'mockPAT'

describe('delete-package-versions', () => {

    afterEach(() => {
        jest.resetAllMocks()
        jest.resetModules()
    })

    afterAll(() => {
        jest.restoreAllMocks()
    })

    describe('success', () => {

        beforeEach(async () => {
            jest.doMock('@actions/core', () => coreMock)
            coreMock.getInput.mockReturnValue('1/2/3')
            jest.doMock('@actions/github', () => githubMock)
            githubMock.getOctokit.mockReturnValue(octokitMock)
            octokitMock.request.mockReturnValueOnce({
                data: [
                    {
                        id: 'id1.1',
                        name: 'apple1'
                    }, {
                        id: 'id1.2',
                        name: 'apple1'
                    }, {
                        id: 'id2',
                        name: 'apple2'
                    }, {
                        id: 'id',
                        name: 'apple'
                    }, {
                        id: 'id5',
                        name: 'apple5'
                    }, {
                        id: 'id3',
                        name: 'apple3'
                    }, {
                        id: 'id7',
                        name: 'apple7'
                    }
                ]
            })

            await import('./index.js')
        })

        it('should create the octokit with the environemnt token', () => {
            expect(githubMock.getOctokit.mock.lastCall[0]).toBe('mockPAT')
        })

        it('should call octokit request to the proper endpoint', () => {
            expect(octokitMock.request.mock.calls[0][0]).toBe('GET /orgs/{org}/packages/{package_type}/{package_name}/versions')
            expect(octokitMock.request.mock.calls[0][1].package_type).toBe('npm')
            expect(octokitMock.request.mock.calls[0][1].package_name).toBe('repo_name_mock')
            expect(octokitMock.request.mock.calls[0][1].org).toBe('repo_owner_mock')
        })

        it('should call delete the matched versions', () => {
            expect(octokitMock.request.mock.calls[1][0]).toBe('DELETE /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}')
            expect(octokitMock.request.mock.calls[1][1].package_type).toBe('npm')
            expect(octokitMock.request.mock.calls[1][1].package_name).toBe('repo_name_mock')
            expect(octokitMock.request.mock.calls[1][1].org).toBe('repo_owner_mock')
            expect(octokitMock.request.mock.calls[1][1].package_version_id).toBe('id1.1')

            expect(octokitMock.request.mock.calls[2][0]).toBe('DELETE /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}')
            expect(octokitMock.request.mock.calls[2][1].package_type).toBe('npm')
            expect(octokitMock.request.mock.calls[2][1].package_name).toBe('repo_name_mock')
            expect(octokitMock.request.mock.calls[2][1].org).toBe('repo_owner_mock')
            expect(octokitMock.request.mock.calls[2][1].package_version_id).toBe('id1.2')

            expect(octokitMock.request.mock.calls[3][0]).toBe('DELETE /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}')
            expect(octokitMock.request.mock.calls[3][1].package_type).toBe('npm')
            expect(octokitMock.request.mock.calls[3][1].package_name).toBe('repo_name_mock')
            expect(octokitMock.request.mock.calls[3][1].org).toBe('repo_owner_mock')
            expect(octokitMock.request.mock.calls[3][1].package_version_id).toBe('id2')

            expect(octokitMock.request.mock.calls[4][0]).toBe('DELETE /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}')
            expect(octokitMock.request.mock.calls[4][1].package_type).toBe('npm')
            expect(octokitMock.request.mock.calls[4][1].package_name).toBe('repo_name_mock')
            expect(octokitMock.request.mock.calls[4][1].org).toBe('repo_owner_mock')
            expect(octokitMock.request.mock.calls[4][1].package_version_id).toBe('id3')
        })
    })

    describe('no matches', () => {

        beforeEach(async () => {
            jest.doMock('@actions/core', () => coreMock)
            coreMock.getInput.mockReturnValue('1/2/3')
            jest.doMock('@actions/github', () => githubMock)
            githubMock.getOctokit.mockReturnValue(octokitMock)
            octokitMock.request.mockReturnValueOnce({ data: [
                {
                    id: 'id9',
                    name: 'apple9'
                }
            ] })

            await import('./index.js')
        })

        it('should call error if theres no matchers', () => {
            expect(octokitMock.request).toHaveBeenCalledTimes(1)
        })
    })

    describe('no matchers', () => {

        beforeEach(async () => {
            jest.doMock('@actions/core', () => coreMock)
            jest.doMock('@actions/github', () => githubMock)
            githubMock.getOctokit.mockReturnValue(octokitMock)
            octokitMock.request.mockReturnValueOnce({ data: [
                {
                    id: 'id9',
                    name: 'apple9'
                }
            ] })

            await import('./index.js')
        })

        it('should call error if theres no matchers', () => {
            expect(coreMock.setFailed.mock.lastCall[0]).toBe('No matchers given.')
        })
    })

    describe('error', () => {

        beforeEach(async () => {
            jest.doMock('@actions/core', () => coreMock)
            coreMock.getInput.mockReturnValue('1/2/3')
            jest.doMock('@actions/github', () => githubMock)
            githubMock.getOctokit.mockReturnValue(octokitMock)
            octokitMock.request.mockRejectedValue({ message: 'mock error' })

            await import('./index.js')
        })

        it('should call error if request fails', () => {
            expect(coreMock.setFailed.mock.lastCall[0]).toBe('mock error')
        })
    })
})