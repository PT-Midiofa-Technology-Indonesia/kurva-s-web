import { ProgressMonitoringPage } from '@/domains/project-control/pages/ProgressMonitoringPage';

export default function Page() {
  return (
    <>
      <h6 className="px-7 pt-7">Project Monitoring</h6>
      <ProgressMonitoringPage source="project-management" />
    </>
  );
}
