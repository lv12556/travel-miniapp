import { app } from './app.js'
import { env } from './config/env.js'
import { initializeBootstrapAdmin } from './modules/admin/admin.service.js'

async function start() {
  try {
    const created = await initializeBootstrapAdmin()
    if (created) console.log(`Bootstrap administrator '${env.ADMIN_BOOTSTRAP_USERNAME}' created`)
  } catch (error) {
    console.warn('Database is not ready; API started without bootstrap administrator initialization.', error instanceof Error ? error.message : error)
  }
  app.listen(env.PORT, () => console.log(`API server listening on http://localhost:${env.PORT}/api/v1`))
}

start().catch((error) => { console.error('Unable to start API server', error); process.exit(1) })
