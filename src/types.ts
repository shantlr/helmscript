type AnyString = string & {};

export type HelmChartBuiltin = {
  Release: {
    Name: string;
    Namespace: string;
    Revision: number;
    IsUpgrade: boolean;
    IsInstall: boolean;
    Service: 'Helm' | AnyString;
  };

  Values: any;

  Chart: {
    ApiVersion: string;
    Name: string;
    Version: string;
    KubeVersion?: string;
    Description?: string;
    Type?: string;
    Keywords?: string[];
    AppVersion?: string;
    Deprecated?: boolean;
    Dependencies?: {
      Name: string;
      Version?: string;
      Repository?: string;
      Condition?: string;
      Tags?: string[];
      ImportValues?: any;
      Alias?: string;
    }[];
    Maintainers?: {
      Name: string;
      Email?: string;
      Url?: string;
    }[];
    Sources?: string[];
    Home?: string;
    Icon?: string;
    Annotations?: Record<string, any>;
  };
};
