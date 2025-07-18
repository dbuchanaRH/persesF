// Copyright 2023 The Perses Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { CircularProgress, Stack } from '@mui/material';
import { ErrorAlert, ErrorBoundary } from '@perses-dev/components';
import { ExternalVariableDefinition } from '@perses-dev/dashboards';
import { ViewExplore } from '@perses-dev/explore';
import { PluginRegistry, ProjectStoreProvider, useProjectStore, remotePluginLoader } from '@perses-dev/plugin-system';
import React, { ReactElement, useMemo } from 'react';
import { useGlobalVariableList } from '../../model/global-variable-client';
import { useVariableList } from '../../model/variable-client';
import { buildGlobalVariableDefinition, buildProjectVariableDefinition } from '../../utils/variables';
import { useAllDatasourceResources } from '../../model/datasource-api';

export interface ProjectExploreViewProps {
  exploreTitleComponent?: React.ReactNode;
}

function ProjectExploreView(props: ProjectExploreViewProps): ReactElement {
  return (
    <ProjectStoreProvider enabledURLParams={true}>
      <HelperExploreView {...props} />
    </ProjectStoreProvider>
  );
}

function HelperExploreView(props: ProjectExploreViewProps): ReactElement {
  const { exploreTitleComponent } = props;
  const { project } = useProjectStore();
  const projectName = project?.metadata.name === 'none' ? '' : project?.metadata.name;

  // Collect the Project variables and setup external variables from it
  const { data: globalVars, isLoading: isLoadingGlobalVars } = useGlobalVariableList();
  const { data: projectVars, isLoading: isLoadingProjectVars } = useVariableList(projectName);
  const allDatasources = useAllDatasourceResources();
  const externalVariableDefinitions: ExternalVariableDefinition[] | undefined = useMemo(
    () => [
      buildProjectVariableDefinition(projectName || '', projectVars ?? []),
      buildGlobalVariableDefinition(globalVars ?? []),
    ],
    [projectName, projectVars, globalVars]
  );

  if (isLoadingProjectVars || isLoadingGlobalVars) {
    return (
      <Stack width="100%" sx={{ alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorAlert}>
      <PluginRegistry pluginLoader={remotePluginLoader()}>
        <ErrorBoundary FallbackComponent={ErrorAlert}>
          <ViewExplore
            datasources={allDatasources}
            externalVariableDefinitions={externalVariableDefinitions}
            exploreTitleComponent={exploreTitleComponent}
          />
        </ErrorBoundary>
      </PluginRegistry>
    </ErrorBoundary>
  );
}

export default ProjectExploreView;
