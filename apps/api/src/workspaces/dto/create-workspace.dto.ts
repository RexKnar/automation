import { IsNotEmpty, IsString, Matches, IsOptional } from 'class-validator';

export class CreateWorkspaceDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    @Matches(/^[a-z0-9-]+$/, {
        message: 'Slug must only contain lowercase letters, numbers, and hyphens',
    })
    slug?: string;
}
