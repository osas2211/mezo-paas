import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type DeploymentModel = runtime.Types.Result.DefaultSelection<Prisma.$DeploymentPayload>;
export type AggregateDeployment = {
    _count: DeploymentCountAggregateOutputType | null;
    _min: DeploymentMinAggregateOutputType | null;
    _max: DeploymentMaxAggregateOutputType | null;
};
export type DeploymentMinAggregateOutputType = {
    id: string | null;
    projectId: string | null;
    status: $Enums.DeploymentStatus | null;
    url: string | null;
    name: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    deploymentStartedAt: Date | null;
    deploymentFinishedAt: Date | null;
};
export type DeploymentMaxAggregateOutputType = {
    id: string | null;
    projectId: string | null;
    status: $Enums.DeploymentStatus | null;
    url: string | null;
    name: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    deploymentStartedAt: Date | null;
    deploymentFinishedAt: Date | null;
};
export type DeploymentCountAggregateOutputType = {
    id: number;
    projectId: number;
    status: number;
    url: number;
    name: number;
    createdAt: number;
    updatedAt: number;
    deploymentStartedAt: number;
    deploymentFinishedAt: number;
    _all: number;
};
export type DeploymentMinAggregateInputType = {
    id?: true;
    projectId?: true;
    status?: true;
    url?: true;
    name?: true;
    createdAt?: true;
    updatedAt?: true;
    deploymentStartedAt?: true;
    deploymentFinishedAt?: true;
};
export type DeploymentMaxAggregateInputType = {
    id?: true;
    projectId?: true;
    status?: true;
    url?: true;
    name?: true;
    createdAt?: true;
    updatedAt?: true;
    deploymentStartedAt?: true;
    deploymentFinishedAt?: true;
};
export type DeploymentCountAggregateInputType = {
    id?: true;
    projectId?: true;
    status?: true;
    url?: true;
    name?: true;
    createdAt?: true;
    updatedAt?: true;
    deploymentStartedAt?: true;
    deploymentFinishedAt?: true;
    _all?: true;
};
export type DeploymentAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DeploymentWhereInput;
    orderBy?: Prisma.DeploymentOrderByWithRelationInput | Prisma.DeploymentOrderByWithRelationInput[];
    cursor?: Prisma.DeploymentWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | DeploymentCountAggregateInputType;
    _min?: DeploymentMinAggregateInputType;
    _max?: DeploymentMaxAggregateInputType;
};
export type GetDeploymentAggregateType<T extends DeploymentAggregateArgs> = {
    [P in keyof T & keyof AggregateDeployment]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateDeployment[P]> : Prisma.GetScalarType<T[P], AggregateDeployment[P]>;
};
export type DeploymentGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DeploymentWhereInput;
    orderBy?: Prisma.DeploymentOrderByWithAggregationInput | Prisma.DeploymentOrderByWithAggregationInput[];
    by: Prisma.DeploymentScalarFieldEnum[] | Prisma.DeploymentScalarFieldEnum;
    having?: Prisma.DeploymentScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DeploymentCountAggregateInputType | true;
    _min?: DeploymentMinAggregateInputType;
    _max?: DeploymentMaxAggregateInputType;
};
export type DeploymentGroupByOutputType = {
    id: string;
    projectId: string;
    status: $Enums.DeploymentStatus;
    url: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
    deploymentStartedAt: Date | null;
    deploymentFinishedAt: Date | null;
    _count: DeploymentCountAggregateOutputType | null;
    _min: DeploymentMinAggregateOutputType | null;
    _max: DeploymentMaxAggregateOutputType | null;
};
export type GetDeploymentGroupByPayload<T extends DeploymentGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<DeploymentGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof DeploymentGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], DeploymentGroupByOutputType[P]> : Prisma.GetScalarType<T[P], DeploymentGroupByOutputType[P]>;
}>>;
export type DeploymentWhereInput = {
    AND?: Prisma.DeploymentWhereInput | Prisma.DeploymentWhereInput[];
    OR?: Prisma.DeploymentWhereInput[];
    NOT?: Prisma.DeploymentWhereInput | Prisma.DeploymentWhereInput[];
    id?: Prisma.StringFilter<"Deployment"> | string;
    projectId?: Prisma.StringFilter<"Deployment"> | string;
    status?: Prisma.EnumDeploymentStatusFilter<"Deployment"> | $Enums.DeploymentStatus;
    url?: Prisma.StringFilter<"Deployment"> | string;
    name?: Prisma.StringNullableFilter<"Deployment"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Deployment"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Deployment"> | Date | string;
    deploymentStartedAt?: Prisma.DateTimeNullableFilter<"Deployment"> | Date | string | null;
    deploymentFinishedAt?: Prisma.DateTimeNullableFilter<"Deployment"> | Date | string | null;
    project?: Prisma.XOR<Prisma.ProjectScalarRelationFilter, Prisma.ProjectWhereInput>;
};
export type DeploymentOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    projectId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    url?: Prisma.SortOrder;
    name?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    deploymentStartedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    deploymentFinishedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    project?: Prisma.ProjectOrderByWithRelationInput;
};
export type DeploymentWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    projectId?: string;
    AND?: Prisma.DeploymentWhereInput | Prisma.DeploymentWhereInput[];
    OR?: Prisma.DeploymentWhereInput[];
    NOT?: Prisma.DeploymentWhereInput | Prisma.DeploymentWhereInput[];
    status?: Prisma.EnumDeploymentStatusFilter<"Deployment"> | $Enums.DeploymentStatus;
    url?: Prisma.StringFilter<"Deployment"> | string;
    name?: Prisma.StringNullableFilter<"Deployment"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Deployment"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Deployment"> | Date | string;
    deploymentStartedAt?: Prisma.DateTimeNullableFilter<"Deployment"> | Date | string | null;
    deploymentFinishedAt?: Prisma.DateTimeNullableFilter<"Deployment"> | Date | string | null;
    project?: Prisma.XOR<Prisma.ProjectScalarRelationFilter, Prisma.ProjectWhereInput>;
}, "id" | "projectId">;
export type DeploymentOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    projectId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    url?: Prisma.SortOrder;
    name?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    deploymentStartedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    deploymentFinishedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.DeploymentCountOrderByAggregateInput;
    _max?: Prisma.DeploymentMaxOrderByAggregateInput;
    _min?: Prisma.DeploymentMinOrderByAggregateInput;
};
export type DeploymentScalarWhereWithAggregatesInput = {
    AND?: Prisma.DeploymentScalarWhereWithAggregatesInput | Prisma.DeploymentScalarWhereWithAggregatesInput[];
    OR?: Prisma.DeploymentScalarWhereWithAggregatesInput[];
    NOT?: Prisma.DeploymentScalarWhereWithAggregatesInput | Prisma.DeploymentScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Deployment"> | string;
    projectId?: Prisma.StringWithAggregatesFilter<"Deployment"> | string;
    status?: Prisma.EnumDeploymentStatusWithAggregatesFilter<"Deployment"> | $Enums.DeploymentStatus;
    url?: Prisma.StringWithAggregatesFilter<"Deployment"> | string;
    name?: Prisma.StringNullableWithAggregatesFilter<"Deployment"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Deployment"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Deployment"> | Date | string;
    deploymentStartedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Deployment"> | Date | string | null;
    deploymentFinishedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Deployment"> | Date | string | null;
};
export type DeploymentCreateInput = {
    id?: string;
    status?: $Enums.DeploymentStatus;
    url: string;
    name?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deploymentStartedAt?: Date | string | null;
    deploymentFinishedAt?: Date | string | null;
    project: Prisma.ProjectCreateNestedOneWithoutDeploymentInput;
};
export type DeploymentUncheckedCreateInput = {
    id?: string;
    projectId: string;
    status?: $Enums.DeploymentStatus;
    url: string;
    name?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deploymentStartedAt?: Date | string | null;
    deploymentFinishedAt?: Date | string | null;
};
export type DeploymentUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumDeploymentStatusFieldUpdateOperationsInput | $Enums.DeploymentStatus;
    url?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deploymentStartedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deploymentFinishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    project?: Prisma.ProjectUpdateOneRequiredWithoutDeploymentNestedInput;
};
export type DeploymentUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    projectId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumDeploymentStatusFieldUpdateOperationsInput | $Enums.DeploymentStatus;
    url?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deploymentStartedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deploymentFinishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type DeploymentCreateManyInput = {
    id?: string;
    projectId: string;
    status?: $Enums.DeploymentStatus;
    url: string;
    name?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deploymentStartedAt?: Date | string | null;
    deploymentFinishedAt?: Date | string | null;
};
export type DeploymentUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumDeploymentStatusFieldUpdateOperationsInput | $Enums.DeploymentStatus;
    url?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deploymentStartedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deploymentFinishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type DeploymentUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    projectId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumDeploymentStatusFieldUpdateOperationsInput | $Enums.DeploymentStatus;
    url?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deploymentStartedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deploymentFinishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type DeploymentNullableScalarRelationFilter = {
    is?: Prisma.DeploymentWhereInput | null;
    isNot?: Prisma.DeploymentWhereInput | null;
};
export type DeploymentCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    projectId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    url?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    deploymentStartedAt?: Prisma.SortOrder;
    deploymentFinishedAt?: Prisma.SortOrder;
};
export type DeploymentMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    projectId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    url?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    deploymentStartedAt?: Prisma.SortOrder;
    deploymentFinishedAt?: Prisma.SortOrder;
};
export type DeploymentMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    projectId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    url?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    deploymentStartedAt?: Prisma.SortOrder;
    deploymentFinishedAt?: Prisma.SortOrder;
};
export type DeploymentCreateNestedOneWithoutProjectInput = {
    create?: Prisma.XOR<Prisma.DeploymentCreateWithoutProjectInput, Prisma.DeploymentUncheckedCreateWithoutProjectInput>;
    connectOrCreate?: Prisma.DeploymentCreateOrConnectWithoutProjectInput;
    connect?: Prisma.DeploymentWhereUniqueInput;
};
export type DeploymentUncheckedCreateNestedOneWithoutProjectInput = {
    create?: Prisma.XOR<Prisma.DeploymentCreateWithoutProjectInput, Prisma.DeploymentUncheckedCreateWithoutProjectInput>;
    connectOrCreate?: Prisma.DeploymentCreateOrConnectWithoutProjectInput;
    connect?: Prisma.DeploymentWhereUniqueInput;
};
export type DeploymentUpdateOneWithoutProjectNestedInput = {
    create?: Prisma.XOR<Prisma.DeploymentCreateWithoutProjectInput, Prisma.DeploymentUncheckedCreateWithoutProjectInput>;
    connectOrCreate?: Prisma.DeploymentCreateOrConnectWithoutProjectInput;
    upsert?: Prisma.DeploymentUpsertWithoutProjectInput;
    disconnect?: Prisma.DeploymentWhereInput | boolean;
    delete?: Prisma.DeploymentWhereInput | boolean;
    connect?: Prisma.DeploymentWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.DeploymentUpdateToOneWithWhereWithoutProjectInput, Prisma.DeploymentUpdateWithoutProjectInput>, Prisma.DeploymentUncheckedUpdateWithoutProjectInput>;
};
export type DeploymentUncheckedUpdateOneWithoutProjectNestedInput = {
    create?: Prisma.XOR<Prisma.DeploymentCreateWithoutProjectInput, Prisma.DeploymentUncheckedCreateWithoutProjectInput>;
    connectOrCreate?: Prisma.DeploymentCreateOrConnectWithoutProjectInput;
    upsert?: Prisma.DeploymentUpsertWithoutProjectInput;
    disconnect?: Prisma.DeploymentWhereInput | boolean;
    delete?: Prisma.DeploymentWhereInput | boolean;
    connect?: Prisma.DeploymentWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.DeploymentUpdateToOneWithWhereWithoutProjectInput, Prisma.DeploymentUpdateWithoutProjectInput>, Prisma.DeploymentUncheckedUpdateWithoutProjectInput>;
};
export type EnumDeploymentStatusFieldUpdateOperationsInput = {
    set?: $Enums.DeploymentStatus;
};
export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
};
export type DeploymentCreateWithoutProjectInput = {
    id?: string;
    status?: $Enums.DeploymentStatus;
    url: string;
    name?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deploymentStartedAt?: Date | string | null;
    deploymentFinishedAt?: Date | string | null;
};
export type DeploymentUncheckedCreateWithoutProjectInput = {
    id?: string;
    status?: $Enums.DeploymentStatus;
    url: string;
    name?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deploymentStartedAt?: Date | string | null;
    deploymentFinishedAt?: Date | string | null;
};
export type DeploymentCreateOrConnectWithoutProjectInput = {
    where: Prisma.DeploymentWhereUniqueInput;
    create: Prisma.XOR<Prisma.DeploymentCreateWithoutProjectInput, Prisma.DeploymentUncheckedCreateWithoutProjectInput>;
};
export type DeploymentUpsertWithoutProjectInput = {
    update: Prisma.XOR<Prisma.DeploymentUpdateWithoutProjectInput, Prisma.DeploymentUncheckedUpdateWithoutProjectInput>;
    create: Prisma.XOR<Prisma.DeploymentCreateWithoutProjectInput, Prisma.DeploymentUncheckedCreateWithoutProjectInput>;
    where?: Prisma.DeploymentWhereInput;
};
export type DeploymentUpdateToOneWithWhereWithoutProjectInput = {
    where?: Prisma.DeploymentWhereInput;
    data: Prisma.XOR<Prisma.DeploymentUpdateWithoutProjectInput, Prisma.DeploymentUncheckedUpdateWithoutProjectInput>;
};
export type DeploymentUpdateWithoutProjectInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumDeploymentStatusFieldUpdateOperationsInput | $Enums.DeploymentStatus;
    url?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deploymentStartedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deploymentFinishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type DeploymentUncheckedUpdateWithoutProjectInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumDeploymentStatusFieldUpdateOperationsInput | $Enums.DeploymentStatus;
    url?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deploymentStartedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deploymentFinishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type DeploymentSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    projectId?: boolean;
    status?: boolean;
    url?: boolean;
    name?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    deploymentStartedAt?: boolean;
    deploymentFinishedAt?: boolean;
    project?: boolean | Prisma.ProjectDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["deployment"]>;
export type DeploymentSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    projectId?: boolean;
    status?: boolean;
    url?: boolean;
    name?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    deploymentStartedAt?: boolean;
    deploymentFinishedAt?: boolean;
    project?: boolean | Prisma.ProjectDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["deployment"]>;
export type DeploymentSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    projectId?: boolean;
    status?: boolean;
    url?: boolean;
    name?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    deploymentStartedAt?: boolean;
    deploymentFinishedAt?: boolean;
    project?: boolean | Prisma.ProjectDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["deployment"]>;
export type DeploymentSelectScalar = {
    id?: boolean;
    projectId?: boolean;
    status?: boolean;
    url?: boolean;
    name?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    deploymentStartedAt?: boolean;
    deploymentFinishedAt?: boolean;
};
export type DeploymentOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "projectId" | "status" | "url" | "name" | "createdAt" | "updatedAt" | "deploymentStartedAt" | "deploymentFinishedAt", ExtArgs["result"]["deployment"]>;
export type DeploymentInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    project?: boolean | Prisma.ProjectDefaultArgs<ExtArgs>;
};
export type DeploymentIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    project?: boolean | Prisma.ProjectDefaultArgs<ExtArgs>;
};
export type DeploymentIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    project?: boolean | Prisma.ProjectDefaultArgs<ExtArgs>;
};
export type $DeploymentPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Deployment";
    objects: {
        project: Prisma.$ProjectPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        projectId: string;
        status: $Enums.DeploymentStatus;
        url: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        deploymentStartedAt: Date | null;
        deploymentFinishedAt: Date | null;
    }, ExtArgs["result"]["deployment"]>;
    composites: {};
};
export type DeploymentGetPayload<S extends boolean | null | undefined | DeploymentDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$DeploymentPayload, S>;
export type DeploymentCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<DeploymentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: DeploymentCountAggregateInputType | true;
};
export interface DeploymentDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Deployment'];
        meta: {
            name: 'Deployment';
        };
    };
    findUnique<T extends DeploymentFindUniqueArgs>(args: Prisma.SelectSubset<T, DeploymentFindUniqueArgs<ExtArgs>>): Prisma.Prisma__DeploymentClient<runtime.Types.Result.GetResult<Prisma.$DeploymentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends DeploymentFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, DeploymentFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__DeploymentClient<runtime.Types.Result.GetResult<Prisma.$DeploymentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends DeploymentFindFirstArgs>(args?: Prisma.SelectSubset<T, DeploymentFindFirstArgs<ExtArgs>>): Prisma.Prisma__DeploymentClient<runtime.Types.Result.GetResult<Prisma.$DeploymentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends DeploymentFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, DeploymentFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__DeploymentClient<runtime.Types.Result.GetResult<Prisma.$DeploymentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends DeploymentFindManyArgs>(args?: Prisma.SelectSubset<T, DeploymentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DeploymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends DeploymentCreateArgs>(args: Prisma.SelectSubset<T, DeploymentCreateArgs<ExtArgs>>): Prisma.Prisma__DeploymentClient<runtime.Types.Result.GetResult<Prisma.$DeploymentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends DeploymentCreateManyArgs>(args?: Prisma.SelectSubset<T, DeploymentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends DeploymentCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, DeploymentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DeploymentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends DeploymentDeleteArgs>(args: Prisma.SelectSubset<T, DeploymentDeleteArgs<ExtArgs>>): Prisma.Prisma__DeploymentClient<runtime.Types.Result.GetResult<Prisma.$DeploymentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends DeploymentUpdateArgs>(args: Prisma.SelectSubset<T, DeploymentUpdateArgs<ExtArgs>>): Prisma.Prisma__DeploymentClient<runtime.Types.Result.GetResult<Prisma.$DeploymentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends DeploymentDeleteManyArgs>(args?: Prisma.SelectSubset<T, DeploymentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends DeploymentUpdateManyArgs>(args: Prisma.SelectSubset<T, DeploymentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends DeploymentUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, DeploymentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DeploymentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends DeploymentUpsertArgs>(args: Prisma.SelectSubset<T, DeploymentUpsertArgs<ExtArgs>>): Prisma.Prisma__DeploymentClient<runtime.Types.Result.GetResult<Prisma.$DeploymentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends DeploymentCountArgs>(args?: Prisma.Subset<T, DeploymentCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], DeploymentCountAggregateOutputType> : number>;
    aggregate<T extends DeploymentAggregateArgs>(args: Prisma.Subset<T, DeploymentAggregateArgs>): Prisma.PrismaPromise<GetDeploymentAggregateType<T>>;
    groupBy<T extends DeploymentGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: DeploymentGroupByArgs['orderBy'];
    } : {
        orderBy?: DeploymentGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, DeploymentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDeploymentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: DeploymentFieldRefs;
}
export interface Prisma__DeploymentClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    project<T extends Prisma.ProjectDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ProjectDefaultArgs<ExtArgs>>): Prisma.Prisma__ProjectClient<runtime.Types.Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface DeploymentFieldRefs {
    readonly id: Prisma.FieldRef<"Deployment", 'String'>;
    readonly projectId: Prisma.FieldRef<"Deployment", 'String'>;
    readonly status: Prisma.FieldRef<"Deployment", 'DeploymentStatus'>;
    readonly url: Prisma.FieldRef<"Deployment", 'String'>;
    readonly name: Prisma.FieldRef<"Deployment", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Deployment", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Deployment", 'DateTime'>;
    readonly deploymentStartedAt: Prisma.FieldRef<"Deployment", 'DateTime'>;
    readonly deploymentFinishedAt: Prisma.FieldRef<"Deployment", 'DateTime'>;
}
export type DeploymentFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeploymentSelect<ExtArgs> | null;
    omit?: Prisma.DeploymentOmit<ExtArgs> | null;
    include?: Prisma.DeploymentInclude<ExtArgs> | null;
    where: Prisma.DeploymentWhereUniqueInput;
};
export type DeploymentFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeploymentSelect<ExtArgs> | null;
    omit?: Prisma.DeploymentOmit<ExtArgs> | null;
    include?: Prisma.DeploymentInclude<ExtArgs> | null;
    where: Prisma.DeploymentWhereUniqueInput;
};
export type DeploymentFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeploymentSelect<ExtArgs> | null;
    omit?: Prisma.DeploymentOmit<ExtArgs> | null;
    include?: Prisma.DeploymentInclude<ExtArgs> | null;
    where?: Prisma.DeploymentWhereInput;
    orderBy?: Prisma.DeploymentOrderByWithRelationInput | Prisma.DeploymentOrderByWithRelationInput[];
    cursor?: Prisma.DeploymentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DeploymentScalarFieldEnum | Prisma.DeploymentScalarFieldEnum[];
};
export type DeploymentFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeploymentSelect<ExtArgs> | null;
    omit?: Prisma.DeploymentOmit<ExtArgs> | null;
    include?: Prisma.DeploymentInclude<ExtArgs> | null;
    where?: Prisma.DeploymentWhereInput;
    orderBy?: Prisma.DeploymentOrderByWithRelationInput | Prisma.DeploymentOrderByWithRelationInput[];
    cursor?: Prisma.DeploymentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DeploymentScalarFieldEnum | Prisma.DeploymentScalarFieldEnum[];
};
export type DeploymentFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeploymentSelect<ExtArgs> | null;
    omit?: Prisma.DeploymentOmit<ExtArgs> | null;
    include?: Prisma.DeploymentInclude<ExtArgs> | null;
    where?: Prisma.DeploymentWhereInput;
    orderBy?: Prisma.DeploymentOrderByWithRelationInput | Prisma.DeploymentOrderByWithRelationInput[];
    cursor?: Prisma.DeploymentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DeploymentScalarFieldEnum | Prisma.DeploymentScalarFieldEnum[];
};
export type DeploymentCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeploymentSelect<ExtArgs> | null;
    omit?: Prisma.DeploymentOmit<ExtArgs> | null;
    include?: Prisma.DeploymentInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DeploymentCreateInput, Prisma.DeploymentUncheckedCreateInput>;
};
export type DeploymentCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.DeploymentCreateManyInput | Prisma.DeploymentCreateManyInput[];
    skipDuplicates?: boolean;
};
export type DeploymentCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeploymentSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.DeploymentOmit<ExtArgs> | null;
    data: Prisma.DeploymentCreateManyInput | Prisma.DeploymentCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.DeploymentIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type DeploymentUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeploymentSelect<ExtArgs> | null;
    omit?: Prisma.DeploymentOmit<ExtArgs> | null;
    include?: Prisma.DeploymentInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DeploymentUpdateInput, Prisma.DeploymentUncheckedUpdateInput>;
    where: Prisma.DeploymentWhereUniqueInput;
};
export type DeploymentUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.DeploymentUpdateManyMutationInput, Prisma.DeploymentUncheckedUpdateManyInput>;
    where?: Prisma.DeploymentWhereInput;
    limit?: number;
};
export type DeploymentUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeploymentSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.DeploymentOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DeploymentUpdateManyMutationInput, Prisma.DeploymentUncheckedUpdateManyInput>;
    where?: Prisma.DeploymentWhereInput;
    limit?: number;
    include?: Prisma.DeploymentIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type DeploymentUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeploymentSelect<ExtArgs> | null;
    omit?: Prisma.DeploymentOmit<ExtArgs> | null;
    include?: Prisma.DeploymentInclude<ExtArgs> | null;
    where: Prisma.DeploymentWhereUniqueInput;
    create: Prisma.XOR<Prisma.DeploymentCreateInput, Prisma.DeploymentUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.DeploymentUpdateInput, Prisma.DeploymentUncheckedUpdateInput>;
};
export type DeploymentDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeploymentSelect<ExtArgs> | null;
    omit?: Prisma.DeploymentOmit<ExtArgs> | null;
    include?: Prisma.DeploymentInclude<ExtArgs> | null;
    where: Prisma.DeploymentWhereUniqueInput;
};
export type DeploymentDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DeploymentWhereInput;
    limit?: number;
};
export type DeploymentDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeploymentSelect<ExtArgs> | null;
    omit?: Prisma.DeploymentOmit<ExtArgs> | null;
    include?: Prisma.DeploymentInclude<ExtArgs> | null;
};
