
import type { crawlFacet, facetOption } from '../../interface/crawlResult';

// Joy
import Alert from '@mui/joy/Alert';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Checkbox from '@mui/joy/Checkbox';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';

export function FacetList(props: {
	facets: crawlFacet[]
}) {
	const {
		facets = [],
	} = props;

  return (
		<Stack spacing={2} sx={{minWidth: 200}}>
			{facets.map((facet: crawlFacet, index: number) => (
				<Box key={index}>
					{facet.options.length > 0 ? (
						<Box>
							<Typography
								sx={{
									my: 1,
									fontWeight: 600,
								}}
							>
								{facet.name}
							</Typography>
							<Stack spacing={1}>
								{facet.options.map((option: facetOption, key: number) => (
									<Checkbox
										key={key}
										label={`${option.name} (${option.count})`}
										disabled={option.count === 0}
									/>
								
								))}
							</Stack>
						</Box>
					) : ''}
				</Box>
			))}
			<Alert variant="outlined" color="primary" sx={{width: 180}}>
				<Stack spacing={1}>
					<Typography>
						Add custom filters and facets for site sections, content types, and more
					</Typography>
					<Box>
						<Button color="primary" size="sm">
							Learn More
						</Button>
					</Box>
				</Stack>
			</Alert>
		</Stack>
  )
}
