import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateWorkspaceDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[a-z0-9-]+$/, {
        message: 'Slug must only contain lowercase letters, numbers, and hyphens',
    })
    slug?: string;
}
