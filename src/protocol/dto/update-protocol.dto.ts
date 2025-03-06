import { PartialType } from '@nestjs/mapped-types';
import { CreateProtocolDto } from './create-protocol.dto';

export class UpdateProtocolDto extends PartialType(CreateProtocolDto) {} 