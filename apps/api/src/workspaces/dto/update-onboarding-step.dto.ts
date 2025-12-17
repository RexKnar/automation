import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class UpdateOnboardingStepDto {
    @IsInt()
    @IsNotEmpty()
    @Min(1)
    @Max(4)
    step: number;
}
