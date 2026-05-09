"use client"

import { PageHeader } from "@/components/utilities/page-header"
import { CreateProject } from "@/components/project/create-project"

const CreateProjectPage = () => {
  return (
    <div className="space-y-5 md:space-y-10">
      <PageHeader
        title="Create Project"
        subtitle="Import an existing repository or start from scratch"
      />

      <CreateProject />
    </div>
  )
}

export default CreateProjectPage
