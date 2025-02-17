import * as cdk from 'aws-cdk-lib';
import { AmazonLinuxGeneration, AmazonLinuxImage, Instance, InstanceClass, InstanceSize, InstanceType, Port, Vpc } from 'aws-cdk-lib/aws-ec2';
import { ApplicationListener, ApplicationLoadBalancer, ApplicationTargetGroup, } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { InstanceTarget } from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

interface vpcProps extends cdk.StackProps {
  readonly vpc: Vpc;
  readonly alb: ApplicationLoadBalancer;
  readonly listener: ApplicationListener;
};

export class Ec2Stack extends cdk.Stack {
  readonly instance: Instance;
  constructor(scope: Construct, id: string, props: vpcProps) {
    super(scope, id, props);

    this.instance = new Instance(this, 'ec2', {
      vpc: props.vpc,
      instanceType: InstanceType.of(InstanceClass.BURSTABLE2, InstanceSize.MICRO),
      machineImage: new AmazonLinuxImage({ generation: AmazonLinuxGeneration.AMAZON_LINUX_2023 }),
    })

    const target = new ApplicationTargetGroup(this, 'tg', {
      vpc: props.vpc,
      port: 80,
      targets: [new InstanceTarget(this.instance)],
    })

    this.instance.connections.allowFrom(props.alb, Port.HTTP)
  }
}
