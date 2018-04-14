#!/bin/bash

cf set-env ${CF_APP} SERVICES_CONFIG_DISCOVERY_COLLECTION_ID ${SERVICES_CONFIG_DISCOVERY_COLLECTION_ID}

cf set-env ${CF_APP} SERVICES_CONFIG_IOT_CONFIG_credentials_org ${SERVICES_CONFIG_IOT_CONFIG_credentials_org}
cf set-env ${CF_APP} SERVICES_CONFIG_IOT_CONFIG_credentials_id ${SERVICES_CONFIG_IOT_CONFIG_credentials_id}
cf set-env ${CF_APP} SERVICES_CONFIG_IOT_CONFIG_credentials_authkey ${SERVICES_CONFIG_IOT_CONFIG_credentials_authkey}
cf set-env ${CF_APP} SERVICES_CONFIG_IOT_CONFIG_credentials_authtoken ${SERVICES_CONFIG_IOT_CONFIG_credentials_authtoken}
cf set-env ${CF_APP} SERVICES_CONFIG_IOT_CONFIG_credentials_type ${SERVICES_CONFIG_IOT_CONFIG_credentials_type}

cf set-env ${CF_APP} SERVICES_CONFIG_CONVERSATION_credentials_username ${SERVICES_CONFIG_CONVERSATION_credentials_username}
cf set-env ${CF_APP} SERVICES_CONFIG_CONVERSATION_credentials_password ${SERVICES_CONFIG_CONVERSATION_credentials_password}
cf set-env ${CF_APP} SERVICES_CONFIG_CONVERSATION_credentials_url ${SERVICES_CONFIG_CONVERSATION_credentials_url}
cf set-env ${CF_APP} SERVICES_CONFIG_CONVERSATION_credentials_version_date ${SERVICES_CONFIG_CONVERSATION_credentials_version_date}
cf set-env ${CF_APP} SERVICES_CONFIG_CONVERSATION_credentials_version ${SERVICES_CONFIG_CONVERSATION_credentials_version}
cf set-env ${CF_APP} SERVICES_CONFIG_CONVERSATION_credentials_silent ${SERVICES_CONFIG_CONVERSATION_credentials_silent}
cf set-env ${CF_APP} SERVICES_CONFIG_CONVERSATION_worspace_id ${SERVICES_CONFIG_CONVERSATION_worspace_id}

cf set-env ${CF_APP} SERVICES_CONFIG_CLOUDANT_credentials_url ${SERVICES_CONFIG_CLOUDANT_credentials_url}

cf set-env ${CF_APP} PUSH_NOTIFICATION_SERVER_KEY ${PUSH_NOTIFICATION_SERVER_KEY}
cf set-env ${CF_APP} email_username ${email_username}
cf set-env ${CF_APP} email_password ${email_password}

cf set-env ${CF_APP} ENABLE_DISCOVERY ${ENABLE_DISCOVERY}
cf set-env ${CF_APP} SERVICES_CONFIG_DISCOVERY_ENVIRONMENT_ID ${SERVICES_CONFIG_DISCOVERY_ENVIRONMENT_ID}
cf set-env ${CF_APP} SERVICES_CONFIG_DISCOVERY_CONFIGURATION_ID ${SERVICES_CONFIG_DISCOVERY_CONFIGURATION_ID}
cf set-env ${CF_APP} SERVICES_CONFIG_DISCOVERY_COLLECTION_ID ${SERVICES_CONFIG_DISCOVERY_COLLECTION_ID}

cf push "${CF_APP}"

# View logs
# cf logs "${CF_APP}" --recent
