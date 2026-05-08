import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ProjectModel = runtime.Types.Result.DefaultSelection<Prisma.$ProjectPayload>;
export type AggregateProject = {
    _count: ProjectCountAggregateOutputType | null;
    _min: ProjectMinAggregateOutputType | null;
    _max: ProjectMaxAggregateOutputType | null;
};
export type ProjectMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    framework: $Enums.Framework | null;
    nodeVersion: string | null;
    buildCommand: string | null;
    installCommand: string | null;
    outputDirectory: string | null;
    devCommand: string | null;
    gitRepositoryName: string | null;
    gitRepositoryOwner: string | null;
    gitRepositoryType: $Enums.GitProvider | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    userId: string | null;
};
export type ProjectMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    framework: $Enums.Framework | null;
    nodeVersion: string | null;
    buildCommand: string | null;
    installCommand: string | null;
    outputDirectory: string | null;
    devCommand: string | null;
    gitRepositoryName: string | null;
    gitRepositoryOwner: string | null;
    gitRepositoryType: $Enums.GitProvider | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    userId: string | null;
};
export type ProjectCountAggregateOutputType = {
    id: number;
    name: number;
    description: number;
    framework: number;
    nodeVersion: number;
    buildCommand: number;
    installCommand: number;
    outputDirectory: number;
    devCommand: number;
    gitRepositoryName: number;
    gitRepositoryOwner: number;
    gitRepositoryType: number;
    createdAt: number;
    updatedAt: number;
    userId: number;
    _all: number;
};
export type ProjectMinAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    framework?: true;
    nodeVersion?: true;
    buildCommand?: true;
    installCommand?: true;
    outputDirectory?: true;
    devCommand?: true;
    gitRepositoryName?: true;
    gitRepositoryOwner?: true;
    gitRepositoryType?: true;
    createdAt?: true;
    updatedAt?: true;
    userId?: true;
};
export type ProjectMaxAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    framework?: true;
    nodeVersion?: true;
    buildCommand?: true;
    installCommand?: true;
    outputDirectory?: true;
    devCommand?: true;
    gitRepositoryName?: true;
    gitRepositoryOwner?: true;
    gitRepositoryType?: true;
    createdAt?: true;
    updatedAt?: true;
    userId?: true;
};
export type ProjectCountAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    framework?: true;
    nodeVersion?: true;
    buildCommand?: true;
    installCommand?: true;
    outputDirectory?: true;
    devCommand?: true;
    gitRepositoryName?: true;
    gitRepositoryOwner?: true;
    gitRepositoryType?: true;
    createdAt?: true;
    updatedAt?: true;
    userId?: true;
    _all?: true;
};
export type ProjectAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProjectWhereInput;
    orderBy?: Prisma.ProjectOrderByWithRelationInput | Prisma.ProjectOrderByWithRelationInput[];
    cursor?: Prisma.ProjectWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ProjectCountAggregateInputType;
    _min?: ProjectMinAggregateInputType;
    _max?: ProjectMaxAggregateInputType;
};
export type GetProjectAggregateType<T extends ProjectAggregateArgs> = {
    [P in keyof T & keyof AggregateProject]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateProject[P]> : Prisma.GetScalarType<T[P], AggregateProject[P]>;
};
export type ProjectGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProjectWhereInput;
    orderBy?: Prisma.ProjectOrderByWithAggregationInput | Prisma.ProjectOrderByWithAggregationInput[];
    by: Prisma.ProjectScalarFieldEnum[] | Prisma.ProjectScalarFieldEnum;
    having?: Prisma.ProjectScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ProjectCountAggregateInputType | true;
    _min?: ProjectMinAggregateInputType;
    _max?: ProjectMaxAggregateInputType;
};
export type ProjectGroupByOutputType = {
    id: string;
    name: string;
    description: string | null;
    framework: $Enums.Framework;
    nodeVersion: string;
    buildCommand: string | null;
    installCommand: string | null;
    outputDirectory: string | null;
    devCommand: string | null;
    gitRepositoryName: string | null;
    gitRepositoryOwner: string | null;
    gitRepositoryType: $Enums.GitProvider | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    _count: ProjectCountAggregateOutputType | null;
    _min: ProjectMinAggregateOutputType | null;
    _max: ProjectMaxAggregateOutputType | null;
};
export type GetProjectGroupByPayload<T extends ProjectGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ProjectGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ProjectGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ProjectGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ProjectGroupByOutputType[P]>;
}>>;
export type ProjectWhereInput = {
    AND?: Prisma.ProjectWhereInput | Prisma.ProjectWhereInput[];
    OR?: Prisma.ProjectWhereInput[];
    NOT?: Prisma.ProjectWhereInput | Prisma.ProjectWhereInput[];
    id?: Prisma.StringFilter<"Project"> | string;
    name?: Prisma.StringFilter<"Project"> | string;
    description?: Prisma.StringNullableFilter<"Project"> | string | null;
    framework?: Prisma.EnumFrameworkFilter<"Project"> | $Enums.Framework;
    nodeVersion?: Prisma.StringFilter<"Project"> | string;
    buildCommand?: Prisma.StringNullableFilter<"Project"> | string | null;
    installCommand?: Prisma.StringNullableFilter<"Project"> | string | null;
    outputDirectory?: Prisma.StringNullableFilter<"Project"> | string | null;
    devCommand?: Prisma.StringNullableFilter<"Project"> | string | null;
    gitRepositoryName?: Prisma.StringNullableFilter<"Project"> | string | null;
    gitRepositoryOwner?: Prisma.StringNullableFilter<"Project"> | string | null;
    gitRepositoryType?: Prisma.EnumGitProviderNullableFilter<"Project"> | $Enums.GitProvider | null;
    createdAt?: Prisma.DateTimeFilter<"Project"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Project"> | Date | string;
    userId?: Prisma.StringFilter<"Project"> | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    deployment?: Prisma.XOR<Prisma.DeploymentNullableScalarRelationFilter, Prisma.DeploymentWhereInput> | null;
};
export type ProjectOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    framework?: Prisma.SortOrder;
    nodeVersion?: Prisma.SortOrder;
    buildCommand?: Prisma.SortOrderInput | Prisma.SortOrder;
    installCommand?: Prisma.SortOrderInput | Prisma.SortOrder;
    outputDirectory?: Prisma.SortOrderInput | Prisma.SortOrder;
    devCommand?: Prisma.SortOrderInput | Prisma.SortOrder;
    gitRepositoryName?: Prisma.SortOrderInput | Prisma.SortOrder;
    gitRepositoryOwner?: Prisma.SortOrderInput | Prisma.SortOrder;
    gitRepositoryType?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
    deployment?: Prisma.DeploymentOrderByWithRelationInput;
};
export type ProjectWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ProjectWhereInput | Prisma.ProjectWhereInput[];
    OR?: Prisma.ProjectWhereInput[];
    NOT?: Prisma.ProjectWhereInput | Prisma.ProjectWhereInput[];
    name?: Prisma.StringFilter<"Project"> | string;
    description?: Prisma.StringNullableFilter<"Project"> | string | null;
    framework?: Prisma.EnumFrameworkFilter<"Project"> | $Enums.Framework;
    nodeVersion?: Prisma.StringFilter<"Project"> | string;
    buildCommand?: Prisma.StringNullableFilter<"Project"> | string | null;
    installCommand?: Prisma.StringNullableFilter<"Project"> | string | null;
    outputDirectory?: Prisma.StringNullableFilter<"Project"> | string | null;
    devCommand?: Prisma.StringNullableFilter<"Project"> | string | null;
    gitRepositoryName?: Prisma.StringNullableFilter<"Project"> | string | null;
    gitRepositoryOwner?: Prisma.StringNullableFilter<"Project"> | string | null;
    gitRepositoryType?: Prisma.EnumGitProviderNullableFilter<"Project"> | $Enums.GitProvider | null;
    createdAt?: Prisma.DateTimeFilter<"Project"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Project"> | Date | string;
    userId?: Prisma.StringFilter<"Project"> | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    deployment?: Prisma.XOR<Prisma.DeploymentNullableScalarRelationFilter, Prisma.DeploymentWhereInput> | null;
}, "id">;
export type ProjectOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    framework?: Prisma.SortOrder;
    nodeVersion?: Prisma.SortOrder;
    buildCommand?: Prisma.SortOrderInput | Prisma.SortOrder;
    installCommand?: Prisma.SortOrderInput | Prisma.SortOrder;
    outputDirectory?: Prisma.SortOrderInput | Prisma.SortOrder;
    devCommand?: Prisma.SortOrderInput | Prisma.SortOrder;
    gitRepositoryName?: Prisma.SortOrderInput | Prisma.SortOrder;
    gitRepositoryOwner?: Prisma.SortOrderInput | Prisma.SortOrder;
    gitRepositoryType?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    _count?: Prisma.ProjectCountOrderByAggregateInput;
    _max?: Prisma.ProjectMaxOrderByAggregateInput;
    _min?: Prisma.ProjectMinOrderByAggregateInput;
};
export type ProjectScalarWhereWithAggregatesInput = {
    AND?: Prisma.ProjectScalarWhereWithAggregatesInput | Prisma.ProjectScalarWhereWithAggregatesInput[];
    OR?: Prisma.ProjectScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ProjectScalarWhereWithAggregatesInput | Prisma.ProjectScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Project"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Project"> | string;
    description?: Prisma.StringNullableWithAggregatesFilter<"Project"> | string | null;
    framework?: Prisma.EnumFrameworkWithAggregatesFilter<"Project"> | $Enums.Framework;
    nodeVersion?: Prisma.StringWithAggregatesFilter<"Project"> | string;
    buildCommand?: Prisma.StringNullableWithAggregatesFilter<"Project"> | string | null;
    installCommand?: Prisma.StringNullableWithAggregatesFilter<"Project"> | string | null;
    outputDirectory?: Prisma.StringNullableWithAggregatesFilter<"Project"> | string | null;
    devCommand?: Prisma.StringNullableWithAggregatesFilter<"Project"> | string | null;
    gitRepositoryName?: Prisma.StringNullableWithAggregatesFilter<"Project"> | string | null;
    gitRepositoryOwner?: Prisma.StringNullableWithAggregatesFilter<"Project"> | string | null;
    gitRepositoryType?: Prisma.EnumGitProviderNullableWithAggregatesFilter<"Project"> | $Enums.GitProvider | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Project"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Project"> | Date | string;
    userId?: Prisma.StringWithAggregatesFilter<"Project"> | string;
};
export type ProjectCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    framework: $Enums.Framework;
    nodeVersion: string;
    buildCommand?: string | null;
    installCommand?: string | null;
    outputDirectory?: string | null;
    devCommand?: string | null;
    gitRepositoryName?: string | null;
    gitRepositoryOwner?: string | null;
    gitRepositoryType?: $Enums.GitProvider | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutProjectsInput;
    deployment?: Prisma.DeploymentCreateNestedOneWithoutProjectInput;
};
export type ProjectUncheckedCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    framework: $Enums.Framework;
    nodeVersion: string;
    buildCommand?: string | null;
    installCommand?: string | null;
    outputDirectory?: string | null;
    devCommand?: string | null;
    gitRepositoryName?: string | null;
    gitRepositoryOwner?: string | null;
    gitRepositoryType?: $Enums.GitProvider | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userId: string;
    deployment?: Prisma.DeploymentUncheckedCreateNestedOneWithoutProjectInput;
};
export type ProjectUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    framework?: Prisma.EnumFrameworkFieldUpdateOperationsInput | $Enums.Framework;
    nodeVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    buildCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    installCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    outputDirectory?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    devCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryOwner?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryType?: Prisma.NullableEnumGitProviderFieldUpdateOperationsInput | $Enums.GitProvider | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutProjectsNestedInput;
    deployment?: Prisma.DeploymentUpdateOneWithoutProjectNestedInput;
};
export type ProjectUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    framework?: Prisma.EnumFrameworkFieldUpdateOperationsInput | $Enums.Framework;
    nodeVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    buildCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    installCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    outputDirectory?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    devCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryOwner?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryType?: Prisma.NullableEnumGitProviderFieldUpdateOperationsInput | $Enums.GitProvider | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    deployment?: Prisma.DeploymentUncheckedUpdateOneWithoutProjectNestedInput;
};
export type ProjectCreateManyInput = {
    id?: string;
    name: string;
    description?: string | null;
    framework: $Enums.Framework;
    nodeVersion: string;
    buildCommand?: string | null;
    installCommand?: string | null;
    outputDirectory?: string | null;
    devCommand?: string | null;
    gitRepositoryName?: string | null;
    gitRepositoryOwner?: string | null;
    gitRepositoryType?: $Enums.GitProvider | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userId: string;
};
export type ProjectUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    framework?: Prisma.EnumFrameworkFieldUpdateOperationsInput | $Enums.Framework;
    nodeVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    buildCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    installCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    outputDirectory?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    devCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryOwner?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryType?: Prisma.NullableEnumGitProviderFieldUpdateOperationsInput | $Enums.GitProvider | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProjectUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    framework?: Prisma.EnumFrameworkFieldUpdateOperationsInput | $Enums.Framework;
    nodeVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    buildCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    installCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    outputDirectory?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    devCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryOwner?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryType?: Prisma.NullableEnumGitProviderFieldUpdateOperationsInput | $Enums.GitProvider | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ProjectListRelationFilter = {
    every?: Prisma.ProjectWhereInput;
    some?: Prisma.ProjectWhereInput;
    none?: Prisma.ProjectWhereInput;
};
export type ProjectOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ProjectCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    framework?: Prisma.SortOrder;
    nodeVersion?: Prisma.SortOrder;
    buildCommand?: Prisma.SortOrder;
    installCommand?: Prisma.SortOrder;
    outputDirectory?: Prisma.SortOrder;
    devCommand?: Prisma.SortOrder;
    gitRepositoryName?: Prisma.SortOrder;
    gitRepositoryOwner?: Prisma.SortOrder;
    gitRepositoryType?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
};
export type ProjectMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    framework?: Prisma.SortOrder;
    nodeVersion?: Prisma.SortOrder;
    buildCommand?: Prisma.SortOrder;
    installCommand?: Prisma.SortOrder;
    outputDirectory?: Prisma.SortOrder;
    devCommand?: Prisma.SortOrder;
    gitRepositoryName?: Prisma.SortOrder;
    gitRepositoryOwner?: Prisma.SortOrder;
    gitRepositoryType?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
};
export type ProjectMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    framework?: Prisma.SortOrder;
    nodeVersion?: Prisma.SortOrder;
    buildCommand?: Prisma.SortOrder;
    installCommand?: Prisma.SortOrder;
    outputDirectory?: Prisma.SortOrder;
    devCommand?: Prisma.SortOrder;
    gitRepositoryName?: Prisma.SortOrder;
    gitRepositoryOwner?: Prisma.SortOrder;
    gitRepositoryType?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
};
export type ProjectScalarRelationFilter = {
    is?: Prisma.ProjectWhereInput;
    isNot?: Prisma.ProjectWhereInput;
};
export type ProjectCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutUserInput, Prisma.ProjectUncheckedCreateWithoutUserInput> | Prisma.ProjectCreateWithoutUserInput[] | Prisma.ProjectUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutUserInput | Prisma.ProjectCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.ProjectCreateManyUserInputEnvelope;
    connect?: Prisma.ProjectWhereUniqueInput | Prisma.ProjectWhereUniqueInput[];
};
export type ProjectUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutUserInput, Prisma.ProjectUncheckedCreateWithoutUserInput> | Prisma.ProjectCreateWithoutUserInput[] | Prisma.ProjectUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutUserInput | Prisma.ProjectCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.ProjectCreateManyUserInputEnvelope;
    connect?: Prisma.ProjectWhereUniqueInput | Prisma.ProjectWhereUniqueInput[];
};
export type ProjectUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutUserInput, Prisma.ProjectUncheckedCreateWithoutUserInput> | Prisma.ProjectCreateWithoutUserInput[] | Prisma.ProjectUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutUserInput | Prisma.ProjectCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.ProjectUpsertWithWhereUniqueWithoutUserInput | Prisma.ProjectUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.ProjectCreateManyUserInputEnvelope;
    set?: Prisma.ProjectWhereUniqueInput | Prisma.ProjectWhereUniqueInput[];
    disconnect?: Prisma.ProjectWhereUniqueInput | Prisma.ProjectWhereUniqueInput[];
    delete?: Prisma.ProjectWhereUniqueInput | Prisma.ProjectWhereUniqueInput[];
    connect?: Prisma.ProjectWhereUniqueInput | Prisma.ProjectWhereUniqueInput[];
    update?: Prisma.ProjectUpdateWithWhereUniqueWithoutUserInput | Prisma.ProjectUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.ProjectUpdateManyWithWhereWithoutUserInput | Prisma.ProjectUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.ProjectScalarWhereInput | Prisma.ProjectScalarWhereInput[];
};
export type ProjectUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutUserInput, Prisma.ProjectUncheckedCreateWithoutUserInput> | Prisma.ProjectCreateWithoutUserInput[] | Prisma.ProjectUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutUserInput | Prisma.ProjectCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.ProjectUpsertWithWhereUniqueWithoutUserInput | Prisma.ProjectUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.ProjectCreateManyUserInputEnvelope;
    set?: Prisma.ProjectWhereUniqueInput | Prisma.ProjectWhereUniqueInput[];
    disconnect?: Prisma.ProjectWhereUniqueInput | Prisma.ProjectWhereUniqueInput[];
    delete?: Prisma.ProjectWhereUniqueInput | Prisma.ProjectWhereUniqueInput[];
    connect?: Prisma.ProjectWhereUniqueInput | Prisma.ProjectWhereUniqueInput[];
    update?: Prisma.ProjectUpdateWithWhereUniqueWithoutUserInput | Prisma.ProjectUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.ProjectUpdateManyWithWhereWithoutUserInput | Prisma.ProjectUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.ProjectScalarWhereInput | Prisma.ProjectScalarWhereInput[];
};
export type EnumFrameworkFieldUpdateOperationsInput = {
    set?: $Enums.Framework;
};
export type NullableEnumGitProviderFieldUpdateOperationsInput = {
    set?: $Enums.GitProvider | null;
};
export type ProjectCreateNestedOneWithoutDeploymentInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutDeploymentInput, Prisma.ProjectUncheckedCreateWithoutDeploymentInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutDeploymentInput;
    connect?: Prisma.ProjectWhereUniqueInput;
};
export type ProjectUpdateOneRequiredWithoutDeploymentNestedInput = {
    create?: Prisma.XOR<Prisma.ProjectCreateWithoutDeploymentInput, Prisma.ProjectUncheckedCreateWithoutDeploymentInput>;
    connectOrCreate?: Prisma.ProjectCreateOrConnectWithoutDeploymentInput;
    upsert?: Prisma.ProjectUpsertWithoutDeploymentInput;
    connect?: Prisma.ProjectWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProjectUpdateToOneWithWhereWithoutDeploymentInput, Prisma.ProjectUpdateWithoutDeploymentInput>, Prisma.ProjectUncheckedUpdateWithoutDeploymentInput>;
};
export type ProjectCreateWithoutUserInput = {
    id?: string;
    name: string;
    description?: string | null;
    framework: $Enums.Framework;
    nodeVersion: string;
    buildCommand?: string | null;
    installCommand?: string | null;
    outputDirectory?: string | null;
    devCommand?: string | null;
    gitRepositoryName?: string | null;
    gitRepositoryOwner?: string | null;
    gitRepositoryType?: $Enums.GitProvider | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deployment?: Prisma.DeploymentCreateNestedOneWithoutProjectInput;
};
export type ProjectUncheckedCreateWithoutUserInput = {
    id?: string;
    name: string;
    description?: string | null;
    framework: $Enums.Framework;
    nodeVersion: string;
    buildCommand?: string | null;
    installCommand?: string | null;
    outputDirectory?: string | null;
    devCommand?: string | null;
    gitRepositoryName?: string | null;
    gitRepositoryOwner?: string | null;
    gitRepositoryType?: $Enums.GitProvider | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deployment?: Prisma.DeploymentUncheckedCreateNestedOneWithoutProjectInput;
};
export type ProjectCreateOrConnectWithoutUserInput = {
    where: Prisma.ProjectWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutUserInput, Prisma.ProjectUncheckedCreateWithoutUserInput>;
};
export type ProjectCreateManyUserInputEnvelope = {
    data: Prisma.ProjectCreateManyUserInput | Prisma.ProjectCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type ProjectUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.ProjectWhereUniqueInput;
    update: Prisma.XOR<Prisma.ProjectUpdateWithoutUserInput, Prisma.ProjectUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutUserInput, Prisma.ProjectUncheckedCreateWithoutUserInput>;
};
export type ProjectUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.ProjectWhereUniqueInput;
    data: Prisma.XOR<Prisma.ProjectUpdateWithoutUserInput, Prisma.ProjectUncheckedUpdateWithoutUserInput>;
};
export type ProjectUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.ProjectScalarWhereInput;
    data: Prisma.XOR<Prisma.ProjectUpdateManyMutationInput, Prisma.ProjectUncheckedUpdateManyWithoutUserInput>;
};
export type ProjectScalarWhereInput = {
    AND?: Prisma.ProjectScalarWhereInput | Prisma.ProjectScalarWhereInput[];
    OR?: Prisma.ProjectScalarWhereInput[];
    NOT?: Prisma.ProjectScalarWhereInput | Prisma.ProjectScalarWhereInput[];
    id?: Prisma.StringFilter<"Project"> | string;
    name?: Prisma.StringFilter<"Project"> | string;
    description?: Prisma.StringNullableFilter<"Project"> | string | null;
    framework?: Prisma.EnumFrameworkFilter<"Project"> | $Enums.Framework;
    nodeVersion?: Prisma.StringFilter<"Project"> | string;
    buildCommand?: Prisma.StringNullableFilter<"Project"> | string | null;
    installCommand?: Prisma.StringNullableFilter<"Project"> | string | null;
    outputDirectory?: Prisma.StringNullableFilter<"Project"> | string | null;
    devCommand?: Prisma.StringNullableFilter<"Project"> | string | null;
    gitRepositoryName?: Prisma.StringNullableFilter<"Project"> | string | null;
    gitRepositoryOwner?: Prisma.StringNullableFilter<"Project"> | string | null;
    gitRepositoryType?: Prisma.EnumGitProviderNullableFilter<"Project"> | $Enums.GitProvider | null;
    createdAt?: Prisma.DateTimeFilter<"Project"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Project"> | Date | string;
    userId?: Prisma.StringFilter<"Project"> | string;
};
export type ProjectCreateWithoutDeploymentInput = {
    id?: string;
    name: string;
    description?: string | null;
    framework: $Enums.Framework;
    nodeVersion: string;
    buildCommand?: string | null;
    installCommand?: string | null;
    outputDirectory?: string | null;
    devCommand?: string | null;
    gitRepositoryName?: string | null;
    gitRepositoryOwner?: string | null;
    gitRepositoryType?: $Enums.GitProvider | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutProjectsInput;
};
export type ProjectUncheckedCreateWithoutDeploymentInput = {
    id?: string;
    name: string;
    description?: string | null;
    framework: $Enums.Framework;
    nodeVersion: string;
    buildCommand?: string | null;
    installCommand?: string | null;
    outputDirectory?: string | null;
    devCommand?: string | null;
    gitRepositoryName?: string | null;
    gitRepositoryOwner?: string | null;
    gitRepositoryType?: $Enums.GitProvider | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userId: string;
};
export type ProjectCreateOrConnectWithoutDeploymentInput = {
    where: Prisma.ProjectWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutDeploymentInput, Prisma.ProjectUncheckedCreateWithoutDeploymentInput>;
};
export type ProjectUpsertWithoutDeploymentInput = {
    update: Prisma.XOR<Prisma.ProjectUpdateWithoutDeploymentInput, Prisma.ProjectUncheckedUpdateWithoutDeploymentInput>;
    create: Prisma.XOR<Prisma.ProjectCreateWithoutDeploymentInput, Prisma.ProjectUncheckedCreateWithoutDeploymentInput>;
    where?: Prisma.ProjectWhereInput;
};
export type ProjectUpdateToOneWithWhereWithoutDeploymentInput = {
    where?: Prisma.ProjectWhereInput;
    data: Prisma.XOR<Prisma.ProjectUpdateWithoutDeploymentInput, Prisma.ProjectUncheckedUpdateWithoutDeploymentInput>;
};
export type ProjectUpdateWithoutDeploymentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    framework?: Prisma.EnumFrameworkFieldUpdateOperationsInput | $Enums.Framework;
    nodeVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    buildCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    installCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    outputDirectory?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    devCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryOwner?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryType?: Prisma.NullableEnumGitProviderFieldUpdateOperationsInput | $Enums.GitProvider | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutProjectsNestedInput;
};
export type ProjectUncheckedUpdateWithoutDeploymentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    framework?: Prisma.EnumFrameworkFieldUpdateOperationsInput | $Enums.Framework;
    nodeVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    buildCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    installCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    outputDirectory?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    devCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryOwner?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryType?: Prisma.NullableEnumGitProviderFieldUpdateOperationsInput | $Enums.GitProvider | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type ProjectCreateManyUserInput = {
    id?: string;
    name: string;
    description?: string | null;
    framework: $Enums.Framework;
    nodeVersion: string;
    buildCommand?: string | null;
    installCommand?: string | null;
    outputDirectory?: string | null;
    devCommand?: string | null;
    gitRepositoryName?: string | null;
    gitRepositoryOwner?: string | null;
    gitRepositoryType?: $Enums.GitProvider | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ProjectUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    framework?: Prisma.EnumFrameworkFieldUpdateOperationsInput | $Enums.Framework;
    nodeVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    buildCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    installCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    outputDirectory?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    devCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryOwner?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryType?: Prisma.NullableEnumGitProviderFieldUpdateOperationsInput | $Enums.GitProvider | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deployment?: Prisma.DeploymentUpdateOneWithoutProjectNestedInput;
};
export type ProjectUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    framework?: Prisma.EnumFrameworkFieldUpdateOperationsInput | $Enums.Framework;
    nodeVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    buildCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    installCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    outputDirectory?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    devCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryOwner?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryType?: Prisma.NullableEnumGitProviderFieldUpdateOperationsInput | $Enums.GitProvider | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deployment?: Prisma.DeploymentUncheckedUpdateOneWithoutProjectNestedInput;
};
export type ProjectUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    framework?: Prisma.EnumFrameworkFieldUpdateOperationsInput | $Enums.Framework;
    nodeVersion?: Prisma.StringFieldUpdateOperationsInput | string;
    buildCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    installCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    outputDirectory?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    devCommand?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryOwner?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    gitRepositoryType?: Prisma.NullableEnumGitProviderFieldUpdateOperationsInput | $Enums.GitProvider | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProjectSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    framework?: boolean;
    nodeVersion?: boolean;
    buildCommand?: boolean;
    installCommand?: boolean;
    outputDirectory?: boolean;
    devCommand?: boolean;
    gitRepositoryName?: boolean;
    gitRepositoryOwner?: boolean;
    gitRepositoryType?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    userId?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    deployment?: boolean | Prisma.Project$deploymentArgs<ExtArgs>;
}, ExtArgs["result"]["project"]>;
export type ProjectSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    framework?: boolean;
    nodeVersion?: boolean;
    buildCommand?: boolean;
    installCommand?: boolean;
    outputDirectory?: boolean;
    devCommand?: boolean;
    gitRepositoryName?: boolean;
    gitRepositoryOwner?: boolean;
    gitRepositoryType?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    userId?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["project"]>;
export type ProjectSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    framework?: boolean;
    nodeVersion?: boolean;
    buildCommand?: boolean;
    installCommand?: boolean;
    outputDirectory?: boolean;
    devCommand?: boolean;
    gitRepositoryName?: boolean;
    gitRepositoryOwner?: boolean;
    gitRepositoryType?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    userId?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["project"]>;
export type ProjectSelectScalar = {
    id?: boolean;
    name?: boolean;
    description?: boolean;
    framework?: boolean;
    nodeVersion?: boolean;
    buildCommand?: boolean;
    installCommand?: boolean;
    outputDirectory?: boolean;
    devCommand?: boolean;
    gitRepositoryName?: boolean;
    gitRepositoryOwner?: boolean;
    gitRepositoryType?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    userId?: boolean;
};
export type ProjectOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "description" | "framework" | "nodeVersion" | "buildCommand" | "installCommand" | "outputDirectory" | "devCommand" | "gitRepositoryName" | "gitRepositoryOwner" | "gitRepositoryType" | "createdAt" | "updatedAt" | "userId", ExtArgs["result"]["project"]>;
export type ProjectInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    deployment?: boolean | Prisma.Project$deploymentArgs<ExtArgs>;
};
export type ProjectIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type ProjectIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $ProjectPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Project";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
        deployment: Prisma.$DeploymentPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        description: string | null;
        framework: $Enums.Framework;
        nodeVersion: string;
        buildCommand: string | null;
        installCommand: string | null;
        outputDirectory: string | null;
        devCommand: string | null;
        gitRepositoryName: string | null;
        gitRepositoryOwner: string | null;
        gitRepositoryType: $Enums.GitProvider | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }, ExtArgs["result"]["project"]>;
    composites: {};
};
export type ProjectGetPayload<S extends boolean | null | undefined | ProjectDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ProjectPayload, S>;
export type ProjectCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ProjectFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ProjectCountAggregateInputType | true;
};
export interface ProjectDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Project'];
        meta: {
            name: 'Project';
        };
    };
    findUnique<T extends ProjectFindUniqueArgs>(args: Prisma.SelectSubset<T, ProjectFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ProjectFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ProjectFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ProjectFindFirstArgs>(args?: Prisma.SelectSubset<T, ProjectFindFirstArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ProjectFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ProjectFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ProjectFindManyArgs>(args?: Prisma.SelectSubset<T, ProjectFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ProjectCreateArgs>(args: Prisma.SelectSubset<T, ProjectCreateArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ProjectCreateManyArgs>(args?: Prisma.SelectSubset<T, ProjectCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ProjectCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ProjectCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ProjectDeleteArgs>(args: Prisma.SelectSubset<T, ProjectDeleteArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ProjectUpdateArgs>(args: Prisma.SelectSubset<T, ProjectUpdateArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ProjectDeleteManyArgs>(args?: Prisma.SelectSubset<T, ProjectDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ProjectUpdateManyArgs>(args: Prisma.SelectSubset<T, ProjectUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ProjectUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ProjectUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ProjectUpsertArgs>(args: Prisma.SelectSubset<T, ProjectUpsertArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ProjectCountArgs>(args?: Prisma.Subset<T, ProjectCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ProjectCountAggregateOutputType> : number>;
    aggregate<T extends ProjectAggregateArgs>(args: Prisma.Subset<T, ProjectAggregateArgs>): Prisma.PrismaPromise<GetProjectAggregateType<T>>;
    groupBy<T extends ProjectGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ProjectGroupByArgs['orderBy'];
    } : {
        orderBy?: ProjectGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ProjectGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProjectGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ProjectFieldRefs;
}
export interface Prisma__ProjectClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    deployment<T extends Prisma.Project$deploymentArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Project$deploymentArgs<ExtArgs>>): Prisma.Prisma__DeploymentClient<runtime.Types.Result.GetResult<Prisma.$DeploymentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ProjectFieldRefs {
    readonly id: Prisma.FieldRef<"Project", 'String'>;
    readonly name: Prisma.FieldRef<"Project", 'String'>;
    readonly description: Prisma.FieldRef<"Project", 'String'>;
    readonly framework: Prisma.FieldRef<"Project", 'Framework'>;
    readonly nodeVersion: Prisma.FieldRef<"Project", 'String'>;
    readonly buildCommand: Prisma.FieldRef<"Project", 'String'>;
    readonly installCommand: Prisma.FieldRef<"Project", 'String'>;
    readonly outputDirectory: Prisma.FieldRef<"Project", 'String'>;
    readonly devCommand: Prisma.FieldRef<"Project", 'String'>;
    readonly gitRepositoryName: Prisma.FieldRef<"Project", 'String'>;
    readonly gitRepositoryOwner: Prisma.FieldRef<"Project", 'String'>;
    readonly gitRepositoryType: Prisma.FieldRef<"Project", 'GitProvider'>;
    readonly createdAt: Prisma.FieldRef<"Project", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Project", 'DateTime'>;
    readonly userId: Prisma.FieldRef<"Project", 'String'>;
}
export type ProjectFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    where: Prisma.ProjectWhereUniqueInput;
};
export type ProjectFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    where: Prisma.ProjectWhereUniqueInput;
};
export type ProjectFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    where?: Prisma.ProjectWhereInput;
    orderBy?: Prisma.ProjectOrderByWithRelationInput | Prisma.ProjectOrderByWithRelationInput[];
    cursor?: Prisma.ProjectWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ProjectScalarFieldEnum | Prisma.ProjectScalarFieldEnum[];
};
export type ProjectFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    where?: Prisma.ProjectWhereInput;
    orderBy?: Prisma.ProjectOrderByWithRelationInput | Prisma.ProjectOrderByWithRelationInput[];
    cursor?: Prisma.ProjectWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ProjectScalarFieldEnum | Prisma.ProjectScalarFieldEnum[];
};
export type ProjectFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    where?: Prisma.ProjectWhereInput;
    orderBy?: Prisma.ProjectOrderByWithRelationInput | Prisma.ProjectOrderByWithRelationInput[];
    cursor?: Prisma.ProjectWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ProjectScalarFieldEnum | Prisma.ProjectScalarFieldEnum[];
};
export type ProjectCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ProjectCreateInput, Prisma.ProjectUncheckedCreateInput>;
};
export type ProjectCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ProjectCreateManyInput | Prisma.ProjectCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ProjectCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProjectSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    data: Prisma.ProjectCreateManyInput | Prisma.ProjectCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ProjectIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ProjectUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ProjectUpdateInput, Prisma.ProjectUncheckedUpdateInput>;
    where: Prisma.ProjectWhereUniqueInput;
};
export type ProjectUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ProjectUpdateManyMutationInput, Prisma.ProjectUncheckedUpdateManyInput>;
    where?: Prisma.ProjectWhereInput;
    limit?: number;
};
export type ProjectUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProjectSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ProjectUpdateManyMutationInput, Prisma.ProjectUncheckedUpdateManyInput>;
    where?: Prisma.ProjectWhereInput;
    limit?: number;
    include?: Prisma.ProjectIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ProjectUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    where: Prisma.ProjectWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProjectCreateInput, Prisma.ProjectUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ProjectUpdateInput, Prisma.ProjectUncheckedUpdateInput>;
};
export type ProjectDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    include?: Prisma.ProjectInclude<ExtArgs> | null;
    where: Prisma.ProjectWhereUniqueInput;
};
export type ProjectDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProjectWhereInput;
    limit?: number;
};
export type Project$deploymentArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeploymentSelect<ExtArgs> | null;
    omit?: Prisma.DeploymentOmit<ExtArgs> | null;
    include?: Prisma.DeploymentInclude<ExtArgs> | null;
    where?: Prisma.DeploymentWhereInput;
};
export type ProjectDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProjectSelect<ExtArgs> | null;
    omit?: Prisma.ProjectOmit<ExtArgs> | null;
    include?: Prisma.ProjectInclude<ExtArgs> | null;
};
