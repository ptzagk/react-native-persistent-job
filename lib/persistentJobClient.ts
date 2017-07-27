import {Subject} from 'rxjs'
import {JobNumbered, JobHandler} from './jobTypes'
import {JobRunner, JobRunnerType} from './jobRunner'
import {JobPersister, AsyncStorage} from './jobPersistence'


export type PersistentJobClientType = JobRunnerType
export async function PersistentJobClient (
	storeName: string, 
	jobHandlers: Array<JobHandler>, 
	asyncStorage: AsyncStorage,
	modifyJobSubject?: (jobSubject: Subject<JobNumbered>) => Subject<JobNumbered>,
): Promise<PersistentJobClientType> {
	const jobPersister = await JobPersister(storeName, asyncStorage)
	const jobHandlersMap = new Map<string, JobHandler>()
	jobHandlers.forEach(jobHandler => jobHandlersMap.set(jobHandler.jobType, jobHandler))
	await jobPersister.clearDoneJobsFromStore()
	const persistedJobs = await jobPersister.fetchAllPersistedJobs()
	const jobRunner = JobRunner(jobHandlersMap, jobPersister, persistedJobs, modifyJobSubject)

	return {
		...jobRunner
	}
}

